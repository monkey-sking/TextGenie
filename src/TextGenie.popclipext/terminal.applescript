-- terminal.applescript for TextGenie
-- Optimized paste strategy for Terminal.app (which lacks native 'fill without run' API)

set rawText to "{popclip text}"
set cleanedCmd to do shell script "echo " & quoted form of rawText & " | sed -E 's/^[[:space:]$#>%]+//'"

tell application "Terminal"
    activate
    
    if (count of windows) is 0 then
        do script ""
        delay 0.3
    else if "{popclip option useNewTab}" is "1" then
        tell application "System Events"
            keystroke "t" using command down
        end tell
        delay 0.2
    end if
    
    -- Optimized paste: backup not needed if we want speed
    set the clipboard to cleanedCmd
    delay 0.05
    
    tell application "System Events"
        set frontmost of process "Terminal" to true
        keystroke "v" using command down
    end tell
end tell
