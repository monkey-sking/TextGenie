-- terminal.applescript for TextGenie
-- Optimized paste strategy for Terminal.app (which lacks native 'fill without run' API)

set rawText to "{popclip text}"
set cleanedCmd to do shell script ("/bin/echo " & quoted form of rawText & " | /usr/bin/sed -E 's/^[[:space:]$#>%]+//'")

try
    with timeout of 5 seconds
        tell application "Terminal"
            activate
            
            if (count of windows) is 0 then
                do script ""
                delay 0.2
            else if "{popclip option useNewTab}" is "1" then
                my sendCommandKeystroke("Terminal", "t")
                delay 0.15
            end if
        end tell
        
        my pasteIntoProcess("Terminal", cleanedCmd)
    end timeout
on error errMsg number errNum
    display notification "Could not fill Terminal: " & errMsg with title "TextGenie"
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
