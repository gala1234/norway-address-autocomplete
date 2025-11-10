# Norway Address Autocomplete

[cite_start]A production-ready implementation of an address autocomplete feature, based on the exercise prompt[cite: 1]. [cite_start]This repository includes a React front-end and a Node.js (TypeScript) API that searches a Norwegian address dataset[cite: 3, 4].

[cite_start]The goal of this solution is to demonstrate clean, maintainable, and production-ready code[cite: 48].

## Project Structure

This repository is a monorepo containing two separate applications:

* [cite_start]**/backend/**: A Node.js & Express API responsible for loading the address dataset and providing search suggestions[cite: 6].
* [cite_start]**/frontend/**: A React (Vite) single-page application with a search field that consumes the API[cite: 39, 41].

[cite_start]This separation ensures a clean architecture between the front-end and the back-end.

## Key Technical Decisions

[cite_start]To meet the goal of "production-ready code"[cite: 48], the following technical decisions were made:

1.  **Backend: Node.js + TypeScript**
    * [cite_start]**Technology:** Node.js (Express) is used as required[cite: 7].
    * [cite_start]**Language:** **TypeScript** was chosen over plain JavaScript to ensure code quality, maintainability, and scalability. Using strict type-checking (`--strict`) helps catch errors before runtime and makes the code easier to understand.
    * [cite_start]**Data Structure:** The backend will use the `trie-search` library as recommended [cite: 9] to ensure rapid retrieval of suggestions from the JSON dataset.

2.  **Frontend: React + Vite**
    * [cite_start]**Technology:** React is used as required, without any external component libraries for the search field[cite: 39, 40].
    * **Tooling:** We chose **Vite** over the older Create React App (CRA). Vite is the modern standard recommended by the React team, offering significantly faster development and build times, aligning with current industry best practices.
    * **Browser Support:** The solution will support the latest versions of Chrome, Firefox, and **Edge**. [cite_start]The requirement for "IE" (Internet Explorer)  is addressed by supporting its modern successor (Edge), as IE is deprecated and not supported by modern React. This decision will be documented further in the frontend's `README`.

*(This README will be updated with full "How to Run" and "How to Test" instructions upon completion).*