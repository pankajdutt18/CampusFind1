/* ========================================
   CAMPUSFIND — JAVASCRIPT
======================================== */

// Sample listings for demonstration.
// These are fictional examples, not real campus reports.

const sampleItems = [
    {
        id: 1,
        type: "Found",
        category: "Electronics",
        name: "Wireless earbuds case",
        description: "White charging case with no visible brand markings.",
        location: "Student Centre · Ground floor",
        date: "2026-10-26",
        emoji: "🎧",
        tone: "lavender"
    },
    {
        id: 2,
        type: "Lost",
        category: "ID & Cards",
        name: "Student ID card",
        description: "Student card in a clear sleeve with a blue lanyard.",
        location: "Science Block · Lab corridor",
        date: "2026-10-26",
        emoji: "💳",
        tone: "blue"
    },
    {
        id: 3,
        type: "Found",
        category: "Personal",
        name: "Sage green water bottle",
        description: "Reusable bottle with a small star sticker.",
        location: "Central Library · Reading area",
        date: "2026-10-25",
        emoji: "🧴",
        tone: "green"
    },
    {
        id: 4,
        type: "Lost",
        category: "Bags & Books",
        name: "Black notebook",
        description: "A5 notebook containing handwritten lecture notes.",
        location: "Lecture Hall B · Row 4",
        date: "2026-10-24",
        emoji: "📓",
        tone: "orange"
    },
    {
        id: 5,
        type: "Found",
        category: "Electronics",
        name: "USB-C charging adapter",
        description: "Compact white adapter found near a wall outlet.",
        location: "Computer Lab 2 · IT Block",
        date: "2026-10-24",
        emoji: "🔌",
        tone: "yellow"
    },
    {
        id: 6,
        type: "Lost",
        category: "Personal",
        name: "Silver keyring",
        description: "Two keys on a simple ring with a tiny blue tag.",
        location: "Sports Complex · Main entrance",
        date: "2026-10-23",
        emoji: "🔑",
        tone: "rose"
    },
    {
        id: 7,
        type: "Found",
        category: "Bags & Books",
        name: "Canvas tote bag",
        description: "Natural canvas tote with a green graphic print.",
        location: "Cafeteria · Outdoor tables",
        date: "2026-10-22",
        emoji: "👜",
        tone: "aqua"
    },
    {
        id: 8,
        type: "Lost",
        category: "Electronics",
        name: "Graphite wireless mouse",
        description: "Wireless mouse possibly left beside a desktop.",
        location: "Design Studio · Room 104",
        date: "2026-10-21",
        emoji: "🖱️",
        tone: "slate"
    }
];


/* ========================================
   APPLICATION STATE
======================================== */

let items = [...sampleItems];

let activeFilter = "All";
let showAllItems = false;

// Saved item IDs are kept for the current page session.
const savedItems = new Set();

const itemGrid = document.getElementById("itemGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const showAllButton = document.getElementById("showAllButton");

const reportModal = document.getElementById("reportModal");
const reportForm = document.getElementById("reportForm");

const reportFormSection = document.getElementById("reportFormSection");
const successMessage = document.getElementById("successMessage");

const toast = document.getElementById("toast");

let toastTimer;


/* ========================================
   HELPER FUNCTIONS
======================================== */

// Escape user-provided text before inserting it into HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// Get today's date using the local timezone.
function getLocalDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Format dates for the listing cards.
function formatDate(dateString) {
    const date = new Date(dateString + "T12:00:00");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const difference = Math.round(
        (today - date) / (1000 * 60 * 60 * 24)
    );

    if (difference === 0) {
        return "Today";
    }

    if (difference === 1) {
        return "Yesterday";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// Display a notification at the bottom of the screen.
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.add("hidden");
    }, 3000);
}


/* ========================================
   SEARCH, FILTER AND SORT
======================================== */

function getFilteredItems() {
    const query = searchInput.value.trim().toLowerCase();

    let filteredItems = items.filter(function (item) {

        // Category filter
        const matchesCategory =
            activeFilter === "All" ||
            item.category === activeFilter;

        // Search across relevant fields
        const searchableText = [
            item.name,
            item.description,
            item.location,
            item.category,
            item.type
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);

        return matchesCategory && matchesSearch;
    });

    // Sort reports by date
    if (sortSelect.value === "oldest") {
        filteredItems.sort(function (a, b) {
            return a.date.localeCompare(b.date);
        });
    } else {
        filteredItems.sort(function (a, b) {
            return b.date.localeCompare(a.date);
        });
    }

    return filteredItems;
}


/* ========================================
   RENDER ITEM CARDS
======================================== */

function renderItems() {
    const filteredItems = getFilteredItems();

    const visibleItems = showAllItems
        ? filteredItems
        : filteredItems.slice(0, 8);

    itemGrid.innerHTML = visibleItems.map(function (item) {

        const isSaved = savedItems.has(item.id);

        const statusLabel =
            item.type === "Found" ? "FOUND ITEM" : "LOST ITEM";

        return `
            <article class="item-card">

                <div class="item-image tone-${escapeHTML(item.tone)}">

                    <span class="item-status ${item.type.toLowerCase()}">
                        ${statusLabel}
                    </span>

                    <button
                        class="item-save ${isSaved ? "saved" : ""}"
                        data-save="${item.id}"
                        aria-label="${isSaved ? "Unsave" : "Save"} ${escapeHTML(item.name)}"
                        aria-pressed="${isSaved}"
                        type="button"
                    >
                        ${isSaved ? "♥" : "♡"}
                    </button>

                    <span class="item-emoji" aria-hidden="true">
                        ${item.emoji}
                    </span>

                </div>

                <div class="item-body">

                    <div class="item-category">
                        ${escapeHTML(item.category)}
                    </div>

                    <h3 title="${escapeHTML(item.name)}">
                        ${escapeHTML(item.name)}
                    </h3>

                    <p class="item-description">
                        ${escapeHTML(item.description)}
                    </p>

                    <div
                        class="item-meta"
                        title="${escapeHTML(item.location)}"
                    >
                        <span>⌖</span>
                        ${escapeHTML(item.location)}
                    </div>

                </div>

                <div class="item-footer">

                    <span class="item-date">
                        ${formatDate(item.date)}
                    </span>

                    <button
                        class="view-link"
                        data-view="${item.id}"
                        type="button"
                    >
                        View details ↗
                    </button>

                </div>

            </article>
        `;
    }).join("");


    // Show empty state when there are no matches.
    emptyState.classList.toggle(
        "hidden",
        filteredItems.length > 0
    );


    // Show the correct result count.
    resultsCount.textContent =
        `Showing ${visibleItems.length} of ${filteredItems.length} ` +
        `${filteredItems.length === 1 ? "community report" : "community reports"}`;


    // Update total number of reports.
    document.getElementById("itemCount").textContent = items.length;


    // Show "Show all items" only when needed.
    showAllButton.classList.toggle(
        "hidden",
        filteredItems.length <= 8 || showAllItems
    );
}


/* ========================================
   CATEGORY FILTERS
======================================== */

document.getElementById("filterRow").addEventListener(
    "click",
    function (event) {

        const filterButton = event.target.closest("[data-filter]");

        if (!filterButton) {
            return;
        }

        activeFilter = filterButton.dataset.filter;
        showAllItems = false;

        // Update active filter styling.
        document.querySelectorAll(".filter-chip").forEach(
            function (button) {
                button.classList.toggle(
                    "selected",
                    button === filterButton
                );
            }
        );

        renderItems();
    }
);


/* ========================================
   SEARCH EVENTS
======================================== */

searchInput.addEventListener("input", function () {
    showAllItems = false;
    renderItems();
});


sortSelect.addEventListener("change", function () {
    renderItems();
});


showAllButton.addEventListener("click", function () {
    showAllItems = true;
    renderItems();
});


/* ========================================
   SAVE ITEMS
======================================== */

itemGrid.addEventListener("click", function (event) {

    const saveButton = event.target.closest("[data-save]");

    if (!saveButton) {
        return;
    }

    const itemId = Number(saveButton.dataset.save);

    if (savedItems.has(itemId)) {

        savedItems.delete(itemId);

        showToast("Item removed from saved items.");

    } else {

        savedItems.add(itemId);

        showToast("Item saved for this session.");
    }

    renderItems();
});


/* ========================================
   VIEW ITEM DETAILS
======================================== */

itemGrid.addEventListener("click", function (event) {

    const viewButton = event.target.closest("[data-view]");

    if (!viewButton) {
        return;
    }

    const itemId = Number(viewButton.dataset.view);

    const item = items.find(function (entry) {
        return entry.id === itemId;
    });

    if (!item) {
        return;
    }

    showToast(
        `${item.type} item: ${item.name}. ` +
        `Location: ${item.location}. ` +
        "Arrange a safe handover through your campus help desk."
    );
});


/* ========================================
   REPORT MODAL
======================================== */

function openReportModal() {

    reportModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";

    reportFormSection.classList.remove("hidden");
    successMessage.classList.add("hidden");

    setTimeout(function () {
        document.getElementById("reportType").focus();
    }, 50);
}


function closeReportModal() {

    reportModal.classList.add("hidden");

    document.body.style.overflow = "";
}


// Open modal from every report button.
document.querySelectorAll("[data-open-report]").forEach(
    function (button) {

        button.addEventListener("click", openReportModal);
    }
);


// Close modal using its buttons.
document.getElementById("closeModal").addEventListener(
    "click",
    closeReportModal
);

document.getElementById("cancelModal").addEventListener(
    "click",
    closeReportModal
);


// Close modal by clicking the backdrop.
reportModal.addEventListener("click", function (event) {

    if (event.target === reportModal) {
        closeReportModal();
    }
});


// Close modal using Escape.
document.addEventListener("keydown", function (event) {

    if (
        event.key === "Escape" &&
        !reportModal.classList.contains("hidden")
    ) {
        closeReportModal();
    }
});


/* ========================================
   REPORT FORM
======================================== */

// Set the date field to today's date.
const dateInput = document.getElementById("itemDate");

dateInput.value = getLocalDate();
dateInput.max = getLocalDate();


// Emoji and illustration colours for new reports.
const categorySettings = {
    "Electronics": {
        emoji: "🎧",
        tone: "lavender"
    },

    "ID & Cards": {
        emoji: "💳",
        tone: "blue"
    },

    "Bags & Books": {
        emoji: "📓",
        tone: "orange"
    },

    "Personal": {
        emoji: "🔑",
        tone: "green"
    }
};


reportForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const type = document.getElementById("reportType").value;

    const category =
        document.getElementById("reportCategory").value;

    const name =
        document.getElementById("itemName").value.trim();

    const location =
        document.getElementById("itemLocation").value.trim();

    const description =
        document.getElementById("itemDescription").value.trim();

    const date = dateInput.value;


    // Basic validation.
    if (
        !name ||
        !location ||
        !description ||
        !date
    ) {
        showToast("Please complete all required fields.");
        return;
    }

    if (date > getLocalDate()) {
        showToast("Please select today or an earlier date.");
        return;
    }


    const settings = categorySettings[category] || {
        emoji: "📦",
        tone: "lavender"
    };


    // Create a new listing.
    const newItem = {
        id: Date.now(),
        type: type,
        category: category,
        name: name,
        location: location,
        description: description,
        date: date,
        emoji: settings.emoji,
        tone: settings.tone
    };


    // Add the new listing to the top of the board.
    items.unshift(newItem);


    // Reset filters so the new report can be seen.
    activeFilter = "All";
    showAllItems = false;

    searchInput.value = "";
    sortSelect.value = "recent";


    document.querySelectorAll(".filter-chip").forEach(
        function (button) {

            button.classList.toggle(
                "selected",
                button.dataset.filter === "All"
            );
        }
    );


    // Update the displayed listings.
    renderItems();


    // Display success message.
    reportFormSection.classList.add("hidden");
    successMessage.classList.remove("hidden");
});


/* ========================================
   SUCCESS MESSAGE
======================================== */

document.getElementById("successDone").addEventListener(
    "click",
    function () {

        closeReportModal();

        reportForm.reset();

        dateInput.value = getLocalDate();
        dateInput.max = getLocalDate();

        // Return to the listings section.
        document.getElementById("discover").scrollIntoView({
            behavior: "smooth"
        });

        showToast("Your report was added to this demo.");
    }
);


/* ========================================
   SIGN-IN PLACEHOLDER
======================================== */

document.getElementById("signInButton").addEventListener(
    "click",
    function () {

        showToast(
            "Sign-in is a demo feature. Connect authentication to enable accounts."
        );
    }
);


/* ========================================
   MOBILE NAVIGATION
======================================== */

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");


menuToggle.addEventListener("click", function () {

    const isOpen = navigation.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
});


document.querySelectorAll(".nav-link").forEach(
    function (link) {

        link.addEventListener("click", function () {

            navigation.classList.remove("open");

            menuToggle.setAttribute("aria-expanded", "false");

            document.querySelectorAll(".nav-link").forEach(
                function (navLink) {
                    navLink.classList.remove("active");
                }
            );

            link.classList.add("active");
        });
    }
);


/* ========================================
   INITIALISE APPLICATION
======================================== */

renderItems();