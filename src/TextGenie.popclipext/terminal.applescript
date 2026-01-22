-- terminal.applescript for TextGenie
-- Top-level script (no 'on run') for maximum compatibility with PopClip

set rawText to "{popclip text}"
-- Clean the text: strip leading whitespace and prompt symbols ($, #, >, %)
set cleanedCmd to do shell script "echo " & quoted form of rawText & " | sed -E 's/^[[:space:]$#>%]+//'"

tell application "Terminal"
    activate
    delay 0.5 -- Wait for activation
    
    if (count of windows) is 0 then
        do script ""
        delay 1.0 -- Wait for new window initialization
    else if "{popclip option useNewTab}" is "1" then
        tell application "System Events"
            tell process "Terminal"
                keystroke "t" using command down
            end tell
        end tell
        delay 0.8 -- Wait for new tab initialization
    end if
    
    set the clipboard to cleanedCmd
    delay 0.3
    
    tell application "System Events"
        set frontmost of process "Terminal" to true
        keystroke "v" using command down
    end tell
end tell
