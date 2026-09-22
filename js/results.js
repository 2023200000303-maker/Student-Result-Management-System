import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const formSection = document.getElementById("publish-section");
const form = document.getElementById("add-result-form");
const tableBody = document.getElementById("results-table-body");
const searchInput = document.getElementById("search-input");
const actionHeader = document.getElementById("action-header");
const userEmailDisplay = document.getElementById("user-email-display");

const ADMIN_EMAIL = "2023200000303@seu.edu.bd";
let isAdmin = false;
let allResults = [];

// Auth state listener & Role check
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (userEmailDisplay) {
            userEmailDisplay.textContent = user.email;
        }

        if (user.email === ADMIN_EMAIL) {
            isAdmin = true;
            if (formSection) formSection.style.display = "block";
            if (actionHeader) actionHeader.style.display = "";
        } else {
            isAdmin = false;
            if (formSection) formSection.style.display = "none";
            if (actionHeader) actionHeader.style.display = "none";
        }
        fetchResults();
    } else {
        window.location.href = "login.html";
    }
});

// Fetch results from Firestore
async function fetchResults() {
    if (!tableBody) return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "results"));
        allResults = [];
        querySnapshot.forEach((docSnap) => {
            allResults.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderTable(allResults);
    } catch (error) {
        console.error("Error fetching results: ", error);
    }
}

// Render table according to user role
function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${isAdmin ? 5 : 4}" style="text-align: center; color: #94a3b8; padding: 20px;">No result records found.</td></tr>`;
        return;
    }

    data.forEach((item) => {
        const tr = document.createElement("tr");
        
        let actionColumn = "";
        if (isAdmin) {
            actionColumn = `<td><button class="btn btn-outline-danger btn-sm delete-btn" data-id="${item.id}">Delete</button></td>`;
        }

        tr.innerHTML = `
            <td>${item.studentId || ''}</td>
            <td>${item.studentName || ''}</td>
            <td>${item.courseCode || ''}</td>
            <td>${item.gpa || ''}</td>
            ${actionColumn}
        `;
        tableBody.appendChild(tr);
    });

    // Attach delete listeners for Admin
    if (isAdmin) {
        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const docId = e.target.getAttribute("data-id");
                if (confirm("Are you sure you want to delete this record?")) {
                    try {
                        await deleteDoc(doc(db, "results", docId));
                        fetchResults();
                    } catch (err) {
                        console.error("Error deleting doc: ", err);
                        alert("Failed to delete record.");
                    }
                }
            });
        });
    }
}

// Add new result (Admin only)
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!isAdmin) {
            alert("Only admin can publish grades.");
            return;
        }

        const studentId = document.getElementById("student-id").value;
        const studentName = document.getElementById("student-name").value;
        const courseCode = document.getElementById("course-code").value;
        const gpa = document.getElementById("student-gpa").value;

        try {
            await addDoc(collection(db, "results"), {
                studentId: studentId,
                studentName: studentName,
                courseCode: courseCode,
                gpa: gpa,
                createdAt: new Date()
            });

            form.reset();
            fetchResults();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error publishing grade: " + error.message);
        }
    });
}

// Search Filter
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allResults.filter(item => 
            (item.studentId && item.studentId.toLowerCase().includes(term)) ||
            (item.studentName && item.studentName.toLowerCase().includes(term)) ||
            (item.courseCode && item.courseCode.toLowerCase().includes(term))
        );
        renderTable(filtered);
    });
}