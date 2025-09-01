
import { ModelAddPage } from "./pages/ModelAddPage"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ModelsPage from "./pages/ModelsPage"


function App() {

  return (
   
    <Router>

   <Routes>
    <Route path="/" element={<ModelsPage />} />
    <Route path="/add-model" element={<ModelAddPage />} />

   </Routes>
    </Router>

 
  )
}

export default App
