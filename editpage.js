(function(){
      if (window._editMode) {
        document.body.contentEditable = 'false';
        document.designMode = 'off';
        document.getElementById('edit-toolbar')?.remove();
        window._editMode = false;
        return;
      }
      
      window._editMode = true;
      document.body.contentEditable = 'true';
      document.designMode = 'on';
      
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const toolbar = document.createElement('div');
      toolbar.id = 'edit-toolbar';
      toolbar.contentEditable = 'false';
      toolbar.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isDarkMode ? 'rgba(32, 32, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
        backdrop-filter: blur(10px);
        padding: 10px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 999999;
        display: flex;
        gap: 5px;
        font-family: -apple-system, system-ui, sans-serif;
        color: ${isDarkMode ? '#fff' : '#000'};
      `;
      
      const commands = [
        ['Bold', 'bold', '𝐁'],
        ['Italic', 'italic', '𝑰'],
        ['Underline', 'underline', '𝑼'],
        ['Justify Left', 'justifyLeft', '⫷'],
        ['Center', 'justifyCenter', '⋯'],
        ['Justify Right', 'justifyRight', '⫸'],
        ['Ordered List', 'insertOrderedList', '1.'],
        ['Unordered List', 'insertUnorderedList', '•'],
        ['Undo', 'undo', '↶'],
        ['Redo', 'redo', '↷']
      ];
      
      const windowControls = document.createElement('div');
      windowControls.style.cssText = `
        display: flex;
        gap: 6px;
        margin-right: 12px;
      `;

      const windowBtnStyles = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: transparent;
        transition: color 0.2s;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = windowBtnStyles + 'background: #FF5F56;';
      closeBtn.innerHTML = '×';
      closeBtn.addEventListener('mouseover', () => closeBtn.style.color = 'rgba(0,0,0,0.4)');
      closeBtn.addEventListener('mouseout', () => closeBtn.style.color = 'transparent');
      closeBtn.addEventListener('click', () => {
        document.body.contentEditable = 'false';
        document.designMode = 'off';
        toolbar.remove();
        window._editMode = false;
      });

      const minBtn = document.createElement('button');
      minBtn.style.cssText = windowBtnStyles + 'background: #FFBD2E;';
      minBtn.innerHTML = '−';
      minBtn.addEventListener('mouseover', () => minBtn.style.color = 'rgba(0,0,0,0.4)');
      minBtn.addEventListener('mouseout', () => minBtn.style.color = 'transparent');

      const maxBtn = document.createElement('button');
      maxBtn.style.cssText = windowBtnStyles + 'background: #28C940;';
      maxBtn.innerHTML = '+';
      maxBtn.addEventListener('mouseover', () => maxBtn.style.color = 'rgba(0,0,0,0.4)');
      maxBtn.addEventListener('mouseout', () => maxBtn.style.color = 'transparent');

      windowControls.appendChild(closeBtn);
      windowControls.appendChild(minBtn);
      windowControls.appendChild(maxBtn);
      toolbar.appendChild(windowControls);
      
      commands.forEach(([label, command, symbol]) => {
        const btn = document.createElement('button');
        btn.innerHTML = symbol;
        btn.title = label;
        btn.style.cssText = `
          border: none;
          background: transparent;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
          font-size: 16px;
          color: ${isDarkMode ? '#fff' : '#000'};
        `;
        btn.addEventListener('mouseover', () => btn.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
        btn.addEventListener('mouseout', () => btn.style.background = 'transparent');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          document.execCommand(command, false);
        });
        toolbar.appendChild(btn);
      });

      const moreContainer = document.createElement('div');
      moreContainer.style.position = 'relative';

      const moreMenu = document.createElement('div');
      moreMenu.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        background: ${isDarkMode ? 'rgba(32, 32, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
        backdrop-filter: blur(10px);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        padding: 5px;
        display: none;
      `;

      const moreCommands = [
        ['Heading 1', 'formatBlock', '<h1>'],
        ['Heading 2', 'formatBlock', '<h2>'],
        ['Paragraph', 'formatBlock', '<p>'],
        ['Strikethrough', 'strikeThrough'],
        ['Indent', 'indent'],
        ['Outdent', 'outdent'],
        ['Clear Formatting', 'removeFormat']
      ];

      moreCommands.forEach(([label, command, value]) => {
        const item = document.createElement('button');
        item.textContent = label;
        item.style.cssText = `
          display: block;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          color: ${isDarkMode ? '#fff' : '#000'};
          border-radius: 4px;
        `;
        item.addEventListener('mouseover', () => item.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
        item.addEventListener('mouseout', () => item.style.background = 'none');
        item.addEventListener('click', (e) => {
          e.preventDefault();
          document.execCommand(command, false, value);
          moreMenu.style.display = 'none';
        });
        moreMenu.appendChild(item);
      });

      moreContainer.appendChild(moreMenu);
      toolbar.appendChild(moreContainer);

      document.body.appendChild(toolbar);

      const handleImageClick = (e) => {
        if (e.target.tagName === 'IMG') {
          e.preventDefault();
          e.stopPropagation();
          
          const img = e.target;
          const currentSrc = img.src;
          
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${isDarkMode ? 'rgba(32, 32, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 999999;
            max-width: 500px;
            width: 90%;
          `;
          
          overlay.innerHTML = `
            <h3 style="margin: 0 0 15px; color: ${isDarkMode ? '#fff' : '#000'}">Edit Image URL</h3>
            <input type="text" value="${currentSrc}" style="
              width: 100%;
              padding: 8px;
              margin-bottom: 15px;
              border: 1px solid ${isDarkMode ? '#666' : '#ddd'};
              border-radius: 5px;
              background: ${isDarkMode ? '#1a1a1a' : '#fff'};
              color: ${isDarkMode ? '#fff' : '#000'};
            ">
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button class="cancel" style="
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                background: ${isDarkMode ? '#666' : '#ddd'};
                color: ${isDarkMode ? '#fff' : '#000'};
                cursor: pointer;
              ">Cancel</button>
              <button class="save" style="
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                background: #007AFF;
                color: white;
                cursor: pointer;
              ">Save</button>
            </div>
          `;
          
          document.body.appendChild(overlay);
          
          const input = overlay.querySelector('input');
          input.focus();
          input.select();
          
          overlay.querySelector('.cancel').addEventListener('click', () => overlay.remove());
          overlay.querySelector('.save').addEventListener('click', () => {
            img.src = input.value;
            overlay.remove();
          });
          
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              img.src = input.value;
              overlay.remove();
            } else if (e.key === 'Escape') {
              overlay.remove();
            }
          });
        }
      };

      document.addEventListener('click', handleImageClick);

      document.addEventListener('click', (e) => {
        if (!moreContainer.contains(e.target)) {
          moreMenu.style.display = 'none';
        }
      });
    })();
