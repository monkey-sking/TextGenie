-- iterm2.applescript for TextGenie
-- Top-level script (no 'on run') for maximum compatibility with PopClip

set rawText to "{popclip text}"
-- Clean the text: strip leading whitespace and prompt symbols ($, #, >, %)
set cleanedCmd to do shell script "echo " & quoted form of rawText & " | sed -E 's/^[[:space:]$#>%]+//'"

tell application id "com.googlecode.iterm2"
    activate
    delay 0.5 -- Wait for activation
    
    if (count windows) is 0 then
        create window with default profile
        delay 1.0 -- Wait for window initialization
    else if "{popclip option useNewTab}" is "1" then
        tell current window
            create tab with default profile
        end tell
        delay 0.8 -- Wait for tab initialization
    end if
    
    -- Target the frontmost session to write cleaned text
    tell current session of current window
        write text cleanedCmd newline false
    end tell
end tell
