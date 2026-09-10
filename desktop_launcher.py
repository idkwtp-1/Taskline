import os
import sys
import ctypes
import time
import socket
import threading
import http.server
import socketserver
import subprocess

APP_USER_MODEL_ID = "antigravity.taskline.app.1.0"
if sys.platform == "win32":
    try:
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(APP_USER_MODEL_ID)
    except Exception:
        pass

if sys.platform == "win32":
    try:
        kernel32 = ctypes.windll.kernel32
        user32 = ctypes.windll.user32
        hwnd = kernel32.GetConsoleWindow()
        if hwnd == 0:
            kernel32.AllocConsole()
            hwnd = kernel32.GetConsoleWindow()
            if hwnd != 0:
                user32.ShowWindow(hwnd, 0)  # SW_HIDE
    except Exception:
        pass

import webview

project_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.join(project_dir, "todo-app")
dist_dir = os.path.join(app_dir, "dist")
log_file_path = os.path.join(project_dir, "launcher.log")

try:
    log_file = open(log_file_path, "a", encoding="utf-8")
    sys.stdout = log_file
    sys.stderr = log_file
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(line_buffering=True)
    print(f"\n--- TaskLine Desktop Launcher Started: {time.strftime('%Y-%m-%d %H:%M:%S')} ---")
except Exception:
    pass


import shutil

def ensure_dist_built():
    index_html = os.path.join(dist_dir, "index.html")
    needs_build = not os.path.exists(index_html)
    if not needs_build:
        dist_mtime = os.path.getmtime(index_html)
        src_dir = os.path.join(app_dir, "src")
        for root, _, files in os.walk(src_dir):
            for file in files:
                filepath = os.path.join(root, file)
                try:
                    if os.path.getmtime(filepath) > dist_mtime:
                        needs_build = True
                        break
                except OSError:
                    pass
            if needs_build:
                break

    if needs_build:
        print("[TaskLine] Code changes detected or bundle missing. Building production bundle...")
        subprocess.run("npm run build", shell=True, cwd=app_dir, check=True)


def cleanup_stale_cache():
    # Clear HTTP and script caches so webview always renders the latest code bundle,
    # while strictly preserving IndexedDB and Local Storage where user tasks reside.
    default_dir = os.path.join(project_dir, "webview_data", "EBWebView", "Default")
    cache_folders = ["Cache", "Code Cache", "Service Worker"]
    for folder in cache_folders:
        target = os.path.join(default_dir, folder)
        if os.path.exists(target):
            try:
                shutil.rmtree(target, ignore_errors=True)
            except Exception as e:
                print(f"[TaskLine] Note cleaning {folder}: {e}")


def get_free_port():
    # Enforce a fixed port to preserve IndexedDB storage across app launches (IndexedDB origin relies on port).
    return 49321


class FastHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=dist_dir, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format, *args):
        pass


def start_instant_server(port):
    socketserver.TCPServer.allow_reuse_address = True
    try:
        server = socketserver.TCPServer(("127.0.0.1", port), FastHTTPRequestHandler)
    except OSError:
        # Port is already in use, which means another instance of TaskLine is likely running.
        # Exit to prevent a random port fallback from wiping the user's IndexedDB data.
        print(f"[TaskLine] Port {port} is in use. Another instance is likely running. Exiting.")
        sys.exit(1)
    
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


window = None
old_wndproc_ptr = None
wndproc_delegate = None


class Api:
    def close_app(self):
        global window
        print("[TaskLine] Close app request received.")
        if window:
            window.destroy()
        else:
            cleanup()
            os._exit(0)


def cleanup():
    global process
    if process:
        print("Stopping TaskLine Vite server...")
        if sys.platform == "win32":
            subprocess.run(
                f"taskkill /F /T /PID {process.pid}",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            try:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            except Exception:
                pass


def configure_window_fullscreen(*args):
    global old_wndproc_ptr, wndproc_delegate
    if sys.platform == "win32":
        try:
            import clr
            import ctypes

            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(APP_USER_MODEL_ID)

            icon_path = os.path.join(project_dir, "Taskline.ico")
            hwnd = None
            if hasattr(window, "native") and window.native:
                form = window.native
                clr.AddReference("System.Drawing")
                clr.AddReference("System.Windows.Forms")
                from System.Drawing import Icon
                from System.Windows.Forms import FormBorderStyle, FormWindowState, Screen

                if os.path.exists(icon_path):
                    form.Icon = Icon(icon_path)

                none_border = getattr(FormBorderStyle, "None")
                form.FormBorderStyle = none_border
                form.WindowState = FormWindowState.Maximized
                form.Bounds = Screen.PrimaryScreen.Bounds

                hwnd = int(form.Handle)

            user32 = ctypes.windll.user32
            if hwnd:
                if os.path.exists(icon_path):
                    WM_SETICON = 0x0080
                    ICON_BIG = 1
                    ICON_SMALL = 0
                    IMAGE_ICON = 1
                    LR_LOADFROMFILE = 0x00000010
                    h_icon = user32.LoadImageW(None, icon_path, IMAGE_ICON, 0, 0, LR_LOADFROMFILE)
                    if h_icon:
                        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL, h_icon)
                        user32.SendMessageW(hwnd, WM_SETICON, ICON_BIG, h_icon)

                GWL_STYLE = -16
                GWL_WNDPROC = -4
                WS_POPUP = 0x80000000
                WS_VISIBLE = 0x10000000
                user32.SetWindowLongW(hwnd, GWL_STYLE, WS_POPUP | WS_VISIBLE)

                cx = user32.GetSystemMetrics(0)
                cy = user32.GetSystemMetrics(1)
                SWP_FRAMECHANGED = 0x0020
                SWP_SHOWWINDOW = 0x0040
                user32.SetWindowPos(hwnd, 0, 0, 0, cx, cy, SWP_FRAMECHANGED | SWP_SHOWWINDOW)

                WNDPROC_TYPE = ctypes.WINFUNCTYPE(
                    ctypes.c_ssize_t, ctypes.c_void_p, ctypes.c_uint, ctypes.c_size_t, ctypes.c_ssize_t
                )

                def custom_wndproc(h_wnd, msg, w_param, l_param):
                    WM_SYSCOMMAND = 0x0112
                    SC_MOVE = 0xF010
                    WM_NCLBUTTONDOWN = 0x00A1
                    WM_NCHITTEST = 0x0084
                    HTCAPTION = 2
                    HTCLIENT = 1

                    if msg == WM_SYSCOMMAND and (w_param & 0xFFF0) == SC_MOVE:
                        return 0

                    if msg == WM_NCLBUTTONDOWN and w_param == HTCAPTION:
                        return 0

                    if msg == WM_NCHITTEST:
                        res = user32.CallWindowProcW(old_wndproc_ptr, h_wnd, msg, w_param, l_param)
                        if res == HTCAPTION:
                            return HTCLIENT
                        return res

                    return user32.CallWindowProcW(old_wndproc_ptr, h_wnd, msg, w_param, l_param)

                wndproc_delegate = WNDPROC_TYPE(custom_wndproc)
                old_wndproc_ptr = (
                    user32.GetWindowLongPtrW(hwnd, GWL_WNDPROC)
                    if hasattr(user32, "GetWindowLongPtrW")
                    else user32.GetWindowLongW(hwnd, GWL_WNDPROC)
                )
                if hasattr(user32, "SetWindowLongPtrW"):
                    user32.SetWindowLongPtrW(hwnd, GWL_WNDPROC, wndproc_delegate)
                else:
                    user32.SetWindowLongW(hwnd, GWL_WNDPROC, wndproc_delegate)

            print("[TaskLine] Fullscreen and drag-lock hooks set successfully.")
        except Exception as ex:
            print("[TaskLine] Note configuring window hooks:", ex)


def main():
    global window
    try:
        ensure_dist_built()
        cleanup_stale_cache()

        port = get_free_port()
        start_instant_server(port)
        active_url = f"http://127.0.0.1:{port}"
        print(f"[TaskLine] Instant static server running on {active_url}")

        api = Api()
        window = webview.create_window(
            title="TaskLine",
            url=active_url,
            background_color="#11131a",
            resizable=False,
            fullscreen=True,
            frameless=True,
            easy_drag=False,
            js_api=api,
        )

        window.events.before_show += configure_window_fullscreen

        webview.start(
            private_mode=False,
            storage_path=os.path.join(project_dir, "webview_data"),
        )

    except BaseException as e:
        import traceback

        print("CRITICAL ERROR inside __main__:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
