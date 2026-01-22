-- path.applescript for TextGenie
-- Robust version with proper ~ expansion and case-insensitive auto-correction

set rawPath to "{popclip text}"
set appPref to "{popclip option preferredFileManager}"

-- 1. Get Environment Info
-- Use native AppleScript to get the home path to avoid shell expansion issues
set homePath to POSIX path of (path to home folder)
set sysUser to do shell script "whoami"

-- 2. Smart Auto-Correction & Placeholder Substitution
set correctedPath to rawPath

-- Replace %user% with actual username
if correctedPath contains "%user%" then
    -- Using python-style replace via sed for simple substitution
    set correctedPath to do shell script "echo " & quoted form of correctedPath & " | sed 's/%user%/" & sysUser & "/g'"
end if

-- PRE-CORRECTION LOGIC (Case-insensitive check)
set lowerPath to do shell script "echo " & quoted form of correctedPath & " | tr '[:upper:]' '[:lower:]'"

if (lowerPath starts with "users/") or (lowerPath starts with "applications/") or (lowerPath starts with "volumes/") then
    if not (correctedPath starts with "/") then
        set correctedPath to "/" & correctedPath
    end if
else if (lowerPath starts with "desktop/") or (lowerPath starts with "downloads/") or (lowerPath starts with "documents/") or ¬
    (lowerPath starts with "library/") or (lowerPath starts with "pictures/") or (lowerPath starts with "movies/") or ¬
    (lowerPath starts with "music/") then
    if not (correctedPath starts with "~/") then
        set correctedPath to "~/" & correctedPath
    end if
else if (correctedPath starts with sysUser & "/") then
    -- Handle case like 'username/Documents'
    set correctedPath to "/Users/" & correctedPath
end if

-- 3. Resolve Path
set resolvedPath to correctedPath
if correctedPath starts with "~/" then
    -- Manually replace ~/ with homePath
    set resolvedPath to homePath & (characters 3 thru -1 of correctedPath as string)
end if

-- Final cleanup of double slashes and expansion
set resolvedPath to do shell script "echo " & quoted form of resolvedPath & " | sed 's|//|/|g'"

-- 4. Verify & Open
set pathExists to false
try
    do shell script "test -e " & quoted form of resolvedPath
    set pathExists to true
on error
    set pathExists to false
end try

if pathExists then
    if appPref is "finder" then
        tell application "Finder"
            activate
            try
                -- Use POSIX file and try to determine item type
                set theItem to (POSIX file resolvedPath) as alias
                set theKind to kind of (info for theItem)
                
                if (theKind is "folder") or (theKind is "Volume") or (theKind is "Disk Image") then
                    open folder theItem
                else
                    reveal theItem
                end if
            on error
                -- Fallback for alias conversion errors
                open (POSIX file resolvedPath)
            end try
        end tell
    else
        set appName to ""
        if appPref is "pathfinder" then
            set appName to "Path Finder"
        else if appPref is "forklift" then
            set appName to "ForkLift"
        else if appPref is "qspace" then
            set appName to "QSpace"
        else if appPref is "commanderone" then
            set appName to "Commander One"
        else if appPref is "marta" then
            set appName to "Marta"
        end if
        
        if appName is not "" then
            do shell script "open -a " & quoted form of appName & " " & quoted form of resolvedPath
        else
            do shell script "open " & quoted form of resolvedPath
        end if
    end if
else
    -- Last resort: try open directly
    try
        do shell script "open " & quoted form of resolvedPath
    on error
        display notification "Could not find path: " & resolvedPath with title "TextGenie"
    end try
end if
