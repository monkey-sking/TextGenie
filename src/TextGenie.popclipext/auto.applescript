-- auto.applescript for TextGenie
-- Hybrid optimized logic combining native iTerm2 and fast-paste Terminal

set rawText to "{popclip text}"
set cleanedCmd to do shell script ("/bin/echo " & quoted form of rawText & " | /usr/bin/sed -E 's/^[[:space:]$#>%]+//'")
set useNewTab to "{popclip option useNewTab}" is "1"

try
    with timeout of 5 seconds
        tell application id "com.googlecode.iterm2" to version
        
        tell application id "com.googlecode.iterm2"
            activate
            if (count windows) is 0 then
                create window with default profile
                delay 0.2
            else if useNewTab then
                tell current window to create tab with default profile
                delay 0.15
            end if
            tell current session of current window to write text cleanedCmd newline false
        end tell
    end timeout
on error
    try
        with timeout of 5 seconds
            tell application "Terminal"
                activate
                if (count windows) is 0 then
                    do script ""
                    delay 0.2
                else if useNewTab then
                    my sendCommandKeystroke("Terminal", "t")
                    delay 0.15
                end if
            end tell
            
            my pasteIntoProcess("Terminal", cleanedCmd)
        end timeout
    on error errMsg number errNum
        display notification "Could not fill terminal: " & errMsg with title "TextGenie"
    end try
end try

on pasteIntoProcess(processName, content)
    set the clipboard to content
    repeat 20 times
        try
            tell application "System Events"
                if exists process processName then
                    set frontmost of process processName to true
                    keystroke "v" using command down
                    return
                end if
            end tell
        end try
        delay 0.05
    end repeat
    
    error "Timed out waiting for " & processName
end pasteIntoProcess

on sendCommandKeystroke(processName, keyChar)
    repeat 20 times
        try
            tell application "System Events"
                if exists process processName then
                    set frontmost of process processName to true
                    keystroke keyChar using command down
                    return
                end if
            end tell
        end try
        delay 0.05
    end repeat
    
    error "Timed out waiting for " & processName
end sendCommandKeystroke
