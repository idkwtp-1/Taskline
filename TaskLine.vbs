' TaskLine PWA Desktop Launcher
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = projectDir
WshShell.Run "pythonw.exe " & Chr(34) & projectDir & "\desktop_launcher.py" & Chr(34), 0, False
