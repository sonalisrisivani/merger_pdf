const fileList = [];
const fileInput = document.getElementById('pdfFiles');
const addFilesButton = document.getElementById('addFilesButton');
const fileGridElement = document.getElementById('fileGrid');

addFilesButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        fileList.push(files[i]);
    }
    renderFileGrid();
}

function renderFileGrid() {
    fileGridElement.innerHTML = '';
    fileList.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.draggable = true;
        div.dataset.index = index;

        const img = document.createElement('img');
        img.src = 'pdf-icon.png'; // Provide your own PDF icon path
        img.alt = 'PDF icon';
        div.appendChild(img);

        const span = document.createElement('span');
        span.textContent = file.name;
        div.appendChild(span);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'X';
        deleteButton.onclick = () => {
            fileList.splice(index, 1);
            renderFileGrid();
        };
        div.appendChild(deleteButton);

        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragover', handleDragOver);
        div.addEventListener('drop', handleDrop);
        div.addEventListener('dragend', handleDragEnd);

        fileGridElement.appendChild(div);
    });
}

let draggedItemIndex = null;

function handleDragStart(event) {
    draggedItemIndex = event.target.dataset.index;
    event.target.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
    const target = event.target.closest('.grid-item');
    if (target) {
        const bounding = target.getBoundingClientRect();
        const offset = bounding.y + bounding.height / 2;
        if (event.clientY - offset > 0) {
            target.style['border-bottom'] = 'solid 4px blue';
            target.style['border-top'] = '';
        } else {
            target.style['border-top'] = 'solid 4px blue';
            target.style['border-bottom'] = '';
        }
    }
}

function handleDrop(event) {
    event.preventDefault();
    const target = event.target.closest('.grid-item');
    if (target) {
        const droppedItemIndex = target.dataset.index;
        const draggedItem = fileList.splice(draggedItemIndex, 1)[0];
        fileList.splice(droppedItemIndex, 0, draggedItem);
        renderFileGrid();
    }
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    const items = document.querySelectorAll('.grid-item');
    items.forEach(item => {
        item.style['border-bottom'] = '';
        item.style['border-top'] = '';
    });
}

async function mergePDFs() {
    const { PDFDocument } = PDFLib;
    if (fileList.length === 0) {
        alert("Please select PDF files to merge.");
        return;
    }

    const mergedPdf = await PDFDocument.create();
    
    for (let file of fileList) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = 'merged.pdf';
    downloadLink.style.display = 'block';
}
