document.addEventListener('DOMContentLoaded', () => {

    // Cache DOM Elements
    const form = document.getElementById('diff-form');
    const editor = document.getElementById('bbcode-input');
    const preview = document.getElementById('bbcode-preview');
    const btnCopy = document.getElementById('btn-copy');
    const btnClear = document.getElementById('btn-clear');

    // Default template framework
    const DEFAULT_TEMPLATE = 
`[notice]
[centre][size=150][b]Difficulty[/b][/size]
[/centre]
[centre]

[/centre]
[/notice]`;

    // Initialize Editor if empty
    if (editor.value.trim() === '') {
        editor.value = DEFAULT_TEMPLATE;
        updatePreview();
    }

    // === 1. Color Data Mapping (Ported from the Python dictionary concept) ===
    // osu! standard difficulty colors at roughly whole star values
    const diffColors = [
        { sr: 0.0, color: { r: 66,  g: 144, b: 251 } }, // Blue
        { sr: 1.5, color: { r: 79,  g: 192, b: 255 } }, // Light Blue
        { sr: 2.0, color: { r: 79,  g: 255, b: 104 } }, // Green
        { sr: 2.5, color: { r: 246, g: 240, b: 92  } }, // Yellow
        { sr: 3.3, color: { r: 255, g: 128, b: 104 } }, // Light Red
        { sr: 4.6, color: { r: 255, g: 60,  b: 113 } }, // Red/Pink
        { sr: 5.9, color: { r: 101, g: 99,  b: 222 } }, // Purple
        { sr: 7.0, color: { r: 24,  g: 21,  b: 142 } }, // Dark Purple
        { sr: 8.0, color: { r: 0,   g: 0,   b: 0   } }  // Black
    ];

    /**
     * Interpolates color between two points based on SR
     */
    function getColorForSR(sr) {
        if (sr <= diffColors[0].sr) return diffColors[0].color;
        if (sr >= diffColors[diffColors.length - 1].sr) return diffColors[diffColors.length - 1].color;

        for (let i = 0; i < diffColors.length - 1; i++) {
            let c1 = diffColors[i];
            let c2 = diffColors[i + 1];

            if (sr >= c1.sr && sr <= c2.sr) {
                // Calculate percentage between the two thresholds
                let range = c2.sr - c1.sr;
                let percent = (sr - c1.sr) / range;
                
                let r = Math.round(c1.color.r + (c2.color.r - c1.color.r) * percent);
                let g = Math.round(c1.color.g + (c2.color.g - c1.color.g) * percent);
                let b = Math.round(c1.color.b + (c2.color.b - c1.color.b) * percent);
                
                return { r, g, b };
            }
        }
        return diffColors[0].color; // fallback
    }

    /**
     * Converts {r,g,b} object to hex string
     */
    function rgbToHex(color) {
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return `${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
    }

    /**
     * Calculates the "Fancy SR Coloring" logic from Python code
     */
    function getFancyColorHex(sr) {
        const baseColor = getColorForSR(sr);
        
        let r = Math.min(baseColor.r + 25, 255);
        let g = Math.min(baseColor.g + 25, 255);
        let b = Math.min(baseColor.b + 25, 255);

        // If very dark, invert it
        if (r <= 40 && g <= 40 && b <= 40) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
        }

        return rgbToHex({ r, g, b });
    }

    // === 2. Form Handling ===
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get Values
        const mode = document.querySelector('input[name="gamemode"]:checked').value;
        const srRaw = parseFloat(document.getElementById('star-rating').value);
        const diffName = document.getElementById('diff-name').value.trim();
        const mapper = document.getElementById('mapper-name').value.trim();

        if (isNaN(srRaw)) return;

        // Round SR logic
        const sr = Math.round(Math.min(srRaw, 9) * 10) / 10;
        const roundedSrStr = sr.toFixed(1); // e.g. "5.4"

        // Generate the Icon string
        const iconUrl = `https://raw.githubusercontent.com/hiderikzki/osu-difficulty-icons/main/rendered/${mode}/stars_${roundedSrStr}.png`;
        const iconBbcode = `[img]${iconUrl}[/img]`;

        // Calculate colors
        const iconColorHex = rgbToHex(getColorForSR(sr)); // Outer color match
        const fancySrHex = getFancyColorHex(sr);          // Inner SR number match

        // Construct Formatting String 
        let outputLine = `${iconBbcode} [color=#${iconColorHex}]${diffName || 'Difficulty'}[/color]`;
        outputLine += ` - [color=#${fancySrHex}]${srRaw}[/color]`;
        
        if (mapper) {
            outputLine += ` by [profile]${mapper}[/profile]`;
        } else {
            // Default to Me colored light gray as in Python script when self
            outputLine += ` by [color=#CFCFCF]Me[/color]`;
        }

        // Add to Editor smartly: look for [/centre]\n[/notice] to insert before it
        const currentText = editor.value;
        const insertTarget = '\n[/centre]\n[/notice]';
        
        if (currentText.includes(insertTarget)) {
            // Insert right before the closing tags of the default template
            const splitParts = currentText.split(insertTarget);
            // If there's already content right before the insert target, add a newline
            const prefix = splitParts[0].endsWith('\n') ? '' : '\n';
            editor.value = splitParts[0] + prefix + outputLine + insertTarget + (splitParts[1] || '');
        } else {
            // Fallback: append at the end
            if (editor.value.trim() !== '') {
                editor.value += '\n'; // Add newline if not empty
            }
            editor.value += outputLine;
        }

        // Trigger Preview Update
        updatePreview();
        
        // Reset form specific fields but keep mode
        document.getElementById('star-rating').value = '';
        document.getElementById('diff-name').value = '';
        document.getElementById('star-rating').focus();
    });

    // === 3. Editor Actions ===
    btnCopy.addEventListener('click', () => {
        if (!editor.value) return;
        navigator.clipboard.writeText(editor.value).then(() => {
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = '✅ Copied!';
            setTimeout(() => { btnCopy.innerHTML = originalText; }, 2000);
        });
    });

    btnClear.addEventListener('click', () => {
        if(confirm('Clear the editor to default template?')) {
            editor.value = DEFAULT_TEMPLATE;
            updatePreview();
        }
    });

    editor.addEventListener('input', updatePreview);

    // === 4. BBCode Toolbar Logic ===
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.getAttribute('data-tag');
            insertBBCode(tag);
        });
    });

    /**
     * Helper to wrap selected text in BBCode brackets.
     */
    function insertBBCode(tag) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        let openTag = `[${tag}]`;
        let closeTag = `[/${tag}]`;

        // Special handling for tags needing attributes
        if (tag === 'url') {
            if (selectedText.startsWith('http')) {
                openTag = `[url=${selectedText}]`;
                editor.setRangeText(`${openTag}Link Text${closeTag}`, start, end, 'select');
            } else {
                openTag = `[url=https://example.com]`;
                editor.setRangeText(`${openTag}${selectedText || 'Link Text'}${closeTag}`, start, end, 'select');
            }
        } else if (tag === 'size') {
            openTag = `[size=150]`;
            editor.setRangeText(`${openTag}${selectedText}${closeTag}`, start, end, 'select');
        } else if (tag === 'box') {
            openTag = `[box=Title]`;
            editor.setRangeText(`${openTag}${selectedText}${closeTag}`, start, end, 'select');
        } else {
            editor.setRangeText(`${openTag}${selectedText}${closeTag}`, start, end, 'select');
        }

        // Move cursor slightly to be useful
        editor.focus();
        if (selectedText.length === 0) {
            const cursorFocus = start + openTag.length;
            editor.setSelectionRange(cursorFocus, cursorFocus);
        }
        
        // Trigger manual preview update
        updatePreview();
    }

    // === 5. Live BBCode Parser Engine ===
    function updatePreview() {
        const rawTexts = editor.value;
        
        if (rawTexts.trim() === '') {
            preview.innerHTML = '<span class="placeholder-text">Preview will appear here...</span>';
            return;
        }

        preview.innerHTML = parseBBCode(rawTexts);
    }

    /**
     * Minimal BBCode to HTML Parser optimized for osu! forums features
     */
    function parseBBCode(text) {
        // Prevent pure HTML injection
        let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // [b]Bold[/b]
        html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>");
        
        // [i]Italic[/i]
        html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>");
        
        // [u]Underline[/u]
        html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u>$1</u>");
        
        // [s]Strikethrough[/s]
        html = html.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, "<s>$1</s>");
        
        // [profile]Username[/profile]
        html = html.replace(/\[profile\]([\s\S]*?)\[\/profile\]/gi, "<a href=\"https://osu.ppy.sh/users/$1\" target=\"_blank\"><strong>$1</strong></a>");

        // [color=#HEX]text[/color] or [color=red]text[/color]
        html = html.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, "<span style=\"color:$1\">$2</span>");
        
        // [size=150]text[/size]
        html = html.replace(/\[size=([^\]]+)\]([\s\S]*?)\[\/size\]/gi, "<span style=\"font-size:$1%\">$2</span>");
        
        // [url=link]text[/url]
        html = html.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, "<a href=\"$1\" target=\"_blank\">$2</a>");
        
        // [url]link[/url]
        html = html.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, "<a href=\"$1\" target=\"_blank\">$1</a>");
        
        // [img]image_url[/img]
        html = html.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, "<img src=\"$1\" alt=\"image\" />");
        
        // [center] / [centre]
        html = html.replace(/\[cent(?:er|re)\]([\s\S]*?)\[\/cent(?:er|re)\]/gi, "<div style=\"text-align:center\">$1</div>");

        // [notice]
        html = html.replace(/\[notice\]([\s\S]*?)\[\/notice\]/gi, "<fieldset style=\"border: 1px solid rgba(255,255,255,0.2); padding: 10px; border-radius: 4px; margin: 10px 0;\">$1</fieldset>");

        // [box=Name]content[/box]
        html = html.replace(/\[box=([^\]]+)\]([\s\S]*?)\[\/box\]/gi, "<details class=\"osu-bbcode-box\"><summary>$1</summary><div class=\"box-content\">$2</div></details>");

        // [box]content[/box]
        html = html.replace(/\[box\]([\s\S]*?)\[\/box\]/gi, "<details class=\"osu-bbcode-box\"><summary>Spoiler</summary><div class=\"box-content\">$1</div></details>");

        // [heading] (usually renders big text in osu)
        html = html.replace(/\[heading\]([\s\S]*?)\[\/heading\]/gi, "<h2 style=\"font-size: 1.5em; margin: 10px 0; border: none;\">$1</h2>");


        // Handle Newlines (convert \n to <br>)
        html = html.replace(/\n/g, '<br/>');

        return html;
    }

    // === 6. Dynamic Background Glow (Removed) ===

    // === 7. Toggle Side Panel Logic ===
    const btnTogglePanel = document.getElementById('btn-toggle-panel');
    const inputPanel = document.getElementById('input-panel');

    if (btnTogglePanel && inputPanel) {
        btnTogglePanel.addEventListener('click', () => {
            inputPanel.classList.toggle('collapsed');
            btnTogglePanel.classList.toggle('collapsed');
        });
    }

});
