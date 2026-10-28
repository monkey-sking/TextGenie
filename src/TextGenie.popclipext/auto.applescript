-- auto.applescript for TextGenie
-- Prefer iTerm2 when installed; only fall back to Terminal when iTerm2 is unavailable.
-- An operational error in an installed iTerm2 should be reported, not silently redirected.

set rawText to "{popclip text}"
set cleanedCmd to do shell script ("/usr/bin/printf '%s' " & quoted form of rawText & " | /usr/bin/sed -E 's/^[[:space:]$#>%]+//'")
set useNewTab to "{popclip option useNewTab}" is "1"

set itermAvailable to false
try
    tell application id "com.googlecode.iterm2" to get version
    set itermAvailable to true
end try

if itermAvailable then
    try
        with timeout of 5 seconds
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
    on error errMsg number errNum
        display notification "iTerm2 is available but TextGenie could not fill it: " & errMsg with title "TextGenie"
    end try
else
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
        display notification "Could not fill Terminal: " & errMsg with title "TextGenie"
    end try
end if

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
