# AO3-Tone-Marks
"Tone Marks II" is based on GodofLaundryBasket's [Google Docs Tone Mark Script](https://godoflaundrybaskets.dreamwidth.org/3315.html) and Cathalinaheart's [Tone Marks](https://github.com/Cathalinaheart/AO3-Tone-Marks) tampermonkey script. This version may break at any time; whenever I have a stable version I'll try to contribute back to Cathalinaheart's repo.

## Current features not yet in Cathalinaheart's version:
- Support for Word of Honor, TGCF, and King's Avatar (I'm not actually in the latter two fandoms, so idk how good I managed to get the support)
- Ability to style replacements using an ao3 skin. Add the following to your site skin to e.g. underline replaced words:
```css
.replacement {
  text-decoration: underline;
}
```

## The fandom.txt file format
For each line 'some text here|fancy replacement', the script replaces all
instances of 'some text here' in the doc with 'fancy replacement'.

 * capitalization on the left side is ignored
 * any spaces on the left side that are between words will match things
 with (a) no space there (b) a dash there or (c) a space there. Examples:
   - The line 'hanguang jun|Hánguāng-jūn' will cause the script to replace
     any of 'hanguang jun', 'hanguangjun', or 'hanguang-jun' with 
     'Hánguāng-jūn'
   - The line 'wen ke xing|Wēn Kèxíng' will cause the script to replace 
     any of 'Wen KeXing','Wen Ke Xing', and 'wen kexing' with 'Wēn Kèxíng'
 * any spaces on the left or right that are before all words or after all
 words will be ignored
 * partial-word matches will be ignored (e.g., if 'lan' is part of 'plan'
 or 'land' it will not be replaced; if 'lan sect' is part of 'plan section'
 it will not be replaced)
 * lines with only spaces on them, or that start with #, will be ignored.


## Installation
If you really wish to install "Tone Marks II" (or if you're me and currently testing it), click [here](https://github.com/irrationalpie7/AO3-Tone-Marks/raw/main/Tone%20Marks%20II.pub.user.js) to install the latest version.