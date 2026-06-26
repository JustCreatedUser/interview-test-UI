import "./App.css"
import { Routes, Route as RouterRoute }  from "react-router";

import NavigationComponent from "./components/Navigation.tsx"

export default function Home() {
  return (
    <>
      { /*<a href="#main-content" className="sr-only focus:not-sr-only" > Skip to main content </a>*/ }
      <aside className="border-gray-lightest h-screen w-61 border"></aside>
      <div className="flex flex-col h-screen w-full">
        <header className="h-12.5 border border-gray-lightest mt-17.5">
          <nav aria-label="Primary navigation" className="h-full flex items-center">
          <NavigationComponent/>
          </nav>
        </header>
        <main className="p-5 h-screen w-full bg-gray-light">
          <div className="h-full bg-primary rounded-2xl p-5">
            <Routes>
              <RouterRoute path="/" element={<h1>Home</h1>}/>
              <RouterRoute path="*" element={<h1> Are you sure</h1>}/>
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}
