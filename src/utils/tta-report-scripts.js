/**
 * TTA Report — Client-side interactivity
 * Handles: test row expansion, step details, filter UI, screenshot modal
 */

function toggleFileGroup(header) {
    const fileGroup = header.parentElement;
    fileGroup.classList.toggle('collapsed');
}

function toggleTestDetail(testId) {
    const detailRow = document.getElementById('detail-row-' + testId);
    if (detailRow) {
        detailRow.style.display = detailRow.style.display === 'none' ? 'table-row' : 'none';
    }
}

function toggleSection(header) {
    const section = header.parentElement;
    section.classList.toggle('section-collapsed');
}

function toggleStepDetails(stepElement, detailsId) {
    const details = document.getElementById(detailsId);
    if (details) {
        if (details.style.display === 'none') {
            details.style.display = 'block';
            stepElement.classList.add('expanded');
        } else {
            details.style.display = 'none';
            stepElement.classList.remove('expanded');
        }
    }
}

function filterByStatus(checkbox) {
    const allCheckbox = document.querySelector('.status-filter[value="all"]');
    if (checkbox.value === 'all') {
        if (checkbox.checked) {
            document.querySelectorAll('.status-filter:not([value="all"])').forEach(cb => cb.checked = false);
        }
    } else {
        if (checkbox.checked && allCheckbox) {
            allCheckbox.checked = false;
        }
        const anyChecked = document.querySelectorAll('.status-filter:not([value="all"]):checked').length > 0;
        if (!anyChecked && allCheckbox) {
            allCheckbox.checked = true;
        }
    }
    applyFilters();
}

function filterByGroup(checkbox) {
    const allCheckbox = document.querySelector('.group-filter[value="all"]');
    if (checkbox.value === 'all') {
        if (checkbox.checked) {
            document.querySelectorAll('.group-filter:not([value="all"])').forEach(cb => cb.checked = false);
        }
    } else {
        if (checkbox.checked && allCheckbox) {
            allCheckbox.checked = false;
        }
        const anyChecked = document.querySelectorAll('.group-filter:not([value="all"]):checked').length > 0;
        if (!anyChecked && allCheckbox) {
            allCheckbox.checked = true;
        }
    }
    applyFilters();
}

function applyFilters() {
    const statusAll = document.querySelector('.status-filter[value="all"]')?.checked;
    const groupAll  = document.querySelector('.group-filter[value="all"]')?.checked;
    const statusFilters = Array.from(document.querySelectorAll('.status-filter:not([value="all"]):checked')).map(f => f.value);
    const groupFilters  = Array.from(document.querySelectorAll('.group-filter:not([value="all"]):checked')).map(f => f.value);

    document.querySelectorAll('.test-row').forEach(row => {
        let statusMatch = statusAll;
        if (!statusMatch) {
            const rowStatus = row.classList.contains('passed') ? 'passed' :
                              row.classList.contains('failed') ? 'failed' : 'skipped';
            statusMatch = statusFilters.includes(rowStatus);
        }

        let groupMatch = groupAll;
        if (!groupMatch) {
            const tags = row.getAttribute('data-tags') || '';
            groupMatch = groupFilters.some(g => tags.toLowerCase().includes(g.toLowerCase()));
        }

        const testId    = row.getAttribute('data-test-id');
        const detailRow = document.getElementById('detail-row-' + testId);

        row.style.display = (statusMatch && groupMatch) ? '' : 'none';
        if (detailRow && detailRow.style.display !== 'none') {
            detailRow.style.display = (statusMatch && groupMatch) ? 'table-row' : 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const modal    = document.getElementById('screenshotModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');

    document.querySelectorAll('.screenshot-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (modal && modalImg) {
                modal.classList.add('active');
                modalImg.src = this.href;
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            modal.classList.remove('active');
        });
    }
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal) {
            modal.classList.remove('active');
        }
    });

    // Auto-expand failed tests
    document.querySelectorAll('.test-row.failed').forEach(row => {
        const testId = row.getAttribute('data-test-id');
        if (testId) {
            toggleTestDetail(testId);
        }
    });
});
