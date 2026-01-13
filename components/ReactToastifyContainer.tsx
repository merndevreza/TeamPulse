'use client' 
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ReactToastifyContainer = () => {
  return <ToastContainer position="top-right" autoClose={5000} theme="light" />
}

export default ReactToastifyContainer
