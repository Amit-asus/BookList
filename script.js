const apiUrl = "https://api.freeapi.app/api/v1/public/books";
let books = [];
let page = 1;
let isListView = true;

const booksContainer = document.getElementById("books-container");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const toggleViewBtn = document.getElementById("toggle-view");
const loadingDiv = document.getElementById("loading");

async function fetchBooks(pageNum) {
  try {
    const response = await fetch(`${apiUrl}?page=${pageNum}`);
    const data = await response.json();
    return data.data.data; // Adjust based on API response structure
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}


function renderBooks(bookList) {
  booksContainer.innerHTML = "";
  bookList.forEach((book) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add("book-item");
    bookItem.innerHTML = `
      <img src="${
        book.volumeInfo.imageLinks?.thumbnail || "placeholder.jpg"
      }" alt="${book.volumeInfo.title}">
      <h3>${book.volumeInfo.title}</h3>
      <p>Author: ${book.volumeInfo.authors?.join(", ") || "Unknown"}</p>
      <p>Publisher: ${book.volumeInfo.publisher || "N/A"}</p>
      <p>Published: ${book.volumeInfo.publishedDate || "N/A"}</p>
    `;
    bookItem.addEventListener("click", () =>
      window.open(book.volumeInfo.infoLink, "_blank")
    );
    booksContainer.appendChild(bookItem);
  });
}


function filterBooks() {
  const query = searchInput.value.toLowerCase();
  const filtered = books.filter(
    (book) =>
      book.volumeInfo.title.toLowerCase().includes(query) ||
      book.volumeInfo.authors?.some((author) =>
        author.toLowerCase().includes(query)
      )
  );
  sortAndRender(filtered);
}


function sortBooks(bookList, sortBy) {
  return bookList.sort((a, b) => {
    if (sortBy === "title-asc")
      return a.volumeInfo.title.localeCompare(b.volumeInfo.title);
    if (sortBy === "title-desc")
      return b.volumeInfo.title.localeCompare(a.volumeInfo.title);
    if (sortBy === "date-asc")
      return (
        new Date(a.volumeInfo.publishedDate) -
        new Date(b.volumeInfo.publishedDate)
      );
    if (sortBy === "date-desc")
      return (
        new Date(b.volumeInfo.publishedDate) -
        new Date(a.volumeInfo.publishedDate)
      );
  });
}

function sortAndRender(bookList) {
  const sorted = sortBooks([...bookList], sortSelect.value);
  renderBooks(sorted);
}


toggleViewBtn.addEventListener("click", () => {
  isListView = !isListView;
  booksContainer.classList.toggle("grid-view", !isListView);
  booksContainer.classList.toggle("list-view", isListView);
  toggleViewBtn.textContent = `Switch to ${isListView ? "Grid" : "List"}`;
});


searchInput.addEventListener("input", filterBooks);
sortSelect.addEventListener("change", () => sortAndRender(books));


window.addEventListener("scroll", async () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    !loadingDiv.style.display
  ) {
    loadingDiv.style.display = "block";
    page++;
    const newBooks = await fetchBooks(page);
    books = [...books, ...newBooks];
    sortAndRender(books);
    loadingDiv.style.display = "none";
  }
});

// First time loading the page 
(async () => {
  books = await fetchBooks(page);
  sortAndRender(books);
})();
