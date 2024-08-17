// score_editor.js

import Sortable from 'sortablejs';

document.addEventListener('turbo:load', function() {
    const validValues = ['+3','+b3','+2','+b2','+1','7','b7','6','b6','5','b5','4','3','b3','2','b2','1','-7','-b7','-6','-b6','-5','-b5','-4','-3','-b3','-2','-b2','-1','ワンプレート','おせち'];
    const specialValues = ['---', 'v', 'x'];

    const songTitleInput = document.getElementById('songTitle');
    const artistNameInput = document.getElementById('artistName');
    const formContainer = document.getElementById('rows-container');

    songTitleInput.addEventListener('input', updateSongInfo);
    artistNameInput.addEventListener('input', updateSongInfo);

    function updateSongInfo() {
        console.log('曲名:', songTitleInput.value);
        console.log('アーティスト名:', artistNameInput.value);
    }

    function updateNumberPosition(input) {
        if (!input.classList.contains('numberInput')) return;

        let value = input.value.toLowerCase();
        let position;

        if (specialValues.includes(value)) {
            const prevInput = input.closest('td').previousElementSibling?.querySelector('.numberInput');
            if (prevInput) {
                const prevPosition = parseFloat(prevInput.style.top) || 0;
                const prevValue = prevInput.value.toLowerCase();
                if (value === '---' || value === prevValue || 
                    ((value === 'v' || value === 'x') && (prevValue === 'v' || prevValue === 'x'))) {
                    position = prevPosition;
                } else if (value === 'v' || value === 'x') {
                    position = prevPosition + 5;
                }
            } else {
                position = getPositionForValue('1');
            }
        } else {
            let matchedValue = value === '' ? '1' : 
                               validValues.find(v => v === value) || 
                               validValues.find(v => v.startsWith(value)) || 
                               '1';
            position = getPositionForValue(matchedValue);
        }

        input.style.top = `${position}px`;
    }

    function getPositionForValue(value) {
        const index = validValues.indexOf(value);
        const cellHeight = 150;
        const inputHeight = 20;
        return index * (cellHeight - inputHeight) / (validValues.length - 1);
    }

    function isValidInput(input) {
        return input === '' || 
               input === '+' || 
               input === '-' || 
               input === 'b' || 
               specialValues.includes(input) || 
               validValues.some(v => v.startsWith(input)) ||
               input === '--';
    }

    function addInputListeners(input) {
        if (input.classList.contains('numberInput')) {
            input.addEventListener('input', function() {
                let inputValue = this.value.toLowerCase();
                if (isValidInput(inputValue)) {
                    this.lastValidValue = inputValue;
                    updateNumberPosition(this);
                } else {
                    this.value = this.lastValidValue || '';
                    updateNumberPosition(this);
                }
            });
        }

        input.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const currentCell = this.closest('td');
                const currentRow = currentCell.closest('tr');
                const cells = Array.from(currentRow.children);
                const currentIndex = cells.indexOf(currentCell);
                let nextIndex = e.key === 'ArrowLeft' ? 
                    (currentIndex - 1 + cells.length) % cells.length : 
                    (currentIndex + 1) % cells.length;
                const nextInput = cells[nextIndex].querySelector('input');
                nextInput.focus();
            }
        });

        if (input.classList.contains('numberInput')) {
            updateNumberPosition(input);
        }
    }

    function addSectionInputListener(input) {
        input.addEventListener('input', function() {
            console.log('入力された展開:', this.value);
        });
    }

    function createNewRow(sourceRow = null) {
        const template = document.getElementById('row-template');
        const newRow = template.content.cloneNode(true).firstElementChild;
        
        const sectionInput = newRow.querySelector('.section-input');
        if (sourceRow) {
            sectionInput.value = sourceRow.querySelector('.section-input').value;
        }
        addSectionInputListener(sectionInput);

        const codeInputs = newRow.querySelectorAll('.codeInput');
        const numberInputs = newRow.querySelectorAll('.numberInput');

        if (sourceRow) {
            const sourceCodeInputs = sourceRow.querySelectorAll('.codeInput');
            const sourceNumberInputs = sourceRow.querySelectorAll('.numberInput');

            codeInputs.forEach((input, index) => {
                input.value = sourceCodeInputs[index].value;
            });

            numberInputs.forEach((input, index) => {
                input.value = sourceNumberInputs[index].value;
                input.style.top = sourceNumberInputs[index].style.top;
            });
        }

        codeInputs.forEach(addInputListeners);
        numberInputs.forEach(addInputListeners);

        return newRow;
    }

    function initializeInputs() {
        document.querySelectorAll('.numberInput, .codeInput').forEach(addInputListeners);
        document.querySelectorAll('.section-input').forEach(addSectionInputListener);
    }

    initializeInputs();

    // イベント委譲を使用して、動的に追加された要素にもイベントリスナーを適用
    formContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('duplicateButton')) {
            const sourceRow = e.target.closest('.row-container');
            const duplicatedRow = createNewRow(sourceRow);
            sourceRow.parentNode.insertBefore(duplicatedRow, sourceRow.nextSibling);
            initializeSortable(); // Sortableを再初期化
        } else if (e.target.classList.contains('deleteButton')) {
            if (document.querySelectorAll('.row-container').length > 1) {
                e.target.closest('.row-container').remove();
            } else {
                alert('最後の行は削除できません。');
            }
        }
    });

    const addButton = document.getElementById('addButton');
    
    if (addButton && formContainer) {
        addButton.addEventListener('click', function() {
            const newRow = createNewRow();
            formContainer.appendChild(newRow);
            initializeSortable(); // Sortableを再初期化
        });
    } else {
        console.error("Add button or form container not found");
    }

    function initializeSortable() {
        if (formContainer) {
            new Sortable(formContainer, {
                animation: 150,
                handle: '.drag-handle',
                draggable: '.row-container',
                onStart: function (evt) {
                    evt.item.classList.add('dragging');
                },
                onEnd: function (evt) {
                    evt.item.classList.remove('dragging');
                }
            });
        }
    }

    initializeSortable();

    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            const form = document.getElementById('score-form');
            const formData = new FormData(form);
            
            const rows = document.querySelectorAll('.row-container');
            const scoreContent = Array.from(rows).map(row => ({
                section: row.querySelector('.section-input').value,
                codes: Array.from(row.querySelectorAll('.codeInput')).map(input => input.value),
                numbers: Array.from(row.querySelectorAll('.numberInput')).map(input => ({
                    value: input.value,
                    position: input.style.top
                }))
            }));

            formData.append('score[title]', document.getElementById('songTitle').value);
            formData.append('score[artist]', document.getElementById('artistName').value);
            formData.append('score[content]', JSON.stringify(scoreContent));

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('スコアが保存されました！');
                    window.location.href = data.redirect_url;
                } else {
                    alert('エラーが発生しました: ' + data.errors.join(', '));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('保存中にエラーが発生しました');
            });
        });
    }

    // 初期行の追加
    if (addButton && document.querySelectorAll('.row-container').length === 0) {
        addButton.click();
    }

    // 表示画面用の関数
    function adjustNumberPositions() {
        const numberInputs = document.querySelectorAll('.numberInput');
        numberInputs.forEach(updateNumberPosition);
    }

    // ページロード時に位置を調整
    adjustNumberPositions();
});