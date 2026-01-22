-- iterm2.applescript for TextGenie
-- Optimized using official iTerm2 native command for instant filling without auto-run

set rawText to "{popclip text}"
-- Clean the text: strip leading whitespace and prompt symbols ($, #, >, %)
set cleanedCmd to do shell script "echo " & quoted form of rawText & " | sed -E 's/^[[:space:]$#>%]+//'"

tell application id "com.googlecode.iterm2"
    activate
    
    if (count windows) is 0 then
        create window with default profile
        delay 0.3 -- Minimal wait for new window
    else if "{popclip option useNewTab}" is "1" then
        tell current window
            create tab with default profile
        end tell
        delay 0.2 -- Minimal wait for new tab
    end if
    
    -- Native command: extremely fast, no spinner, no auto-run
    tell current session of current window
        write text cleanedCmd newline false
    end tell
end tell
