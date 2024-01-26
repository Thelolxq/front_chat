import React from 'react'
import { useEffect, useState } from 'react'
import  io from 'socket.io-client'
import axios from 'axios'
const socket= io('http://localhost:3000',{
  withCredentials:true
})

const chat = () => {
  const [isConnect, SetIsConnect]=useState(false)
  const [newMessage,  SetNewMessage]=useState("")
  const [message,  SetMessage]=useState([])
  const [isRegistered, SetIsRegistered]= useState(false)
  const [usuarios, setUsuarios]=useState()
  const [numUsuariosRegistrados, SetNumUsuariosRegistrados] = useState(0);
  const [formData, SetFormData]=useState({
      usuario:"",
      correo:"",
      contraseña:""
  })

const handleChange=(e)=>{
  SetFormData({...formData, [e.target.name]: e.target.value})
}

  const FechData=async()=>{

    try{
      const response= await axios.post('http://localhost:3000/api/v1/chat', formData)
      alert("exito en mandar el fomulario")
      SetIsRegistered(true)
      const usuarioRegistrado = response.data;
      setUsuarios([usuarioRegistrado]);
    }catch(error){
      console.error('error al enviar el formulario', error.message)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/chat');
        const data = response.data;
        setUsuarios(data);
      } catch (error) {
        console.error('Error al traer los datos', error.message);
      }
    };

    const shortPollingInterval = setInterval(fetchData, 5000); 

    return () => {
      clearInterval(shortPollingInterval);
    };
  }, []);

const handleSumbit = (e)=>{
  e.preventDefault()

if (formData.usuario.trim()=== "" || formData.correo.trim()==="" || formData.contraseña.trim()=== "") {
  alert("todos los campos son obligatorios")
  return
}

  FechData()
  
}
  useEffect(()=>{

      socket.on('connect', ()=> SetIsConnect(true))
      
      socket.on('chat_message', (data)=>{
        SetMessage(message=> [...message, data])
      })
      socket.on('num_usuarios', (num) => {
        SetNumUsuariosRegistrados(num);
      });

      return ()=>{
        socket.off('connect')
        socket.off('chat_message')
        socket.off('num_usuarios')
      }

    },[])
    const enviarMensajes=()=>{
      if (!usuarios || usuarios.length === 0) {
        console.error("No hay usuarios disponibles para enviar mensajes");
        return;
      }
      const usuarioRegistrado = usuarios[0];
      socket.emit('chat_message', {
        usuario:usuarioRegistrado.usuario,
        mensaje:newMessage
      })
      console.log(usuarioRegistrado.usuario)
    }

  return (
    <>
    <div className='h-screen w-screen flex items-center justify-center'>
     {
      isRegistered ?(

      <div className='w-3/4 h-3/4 bg-red-50 relative flex'>
      <i className='h-20 w-fit'>usuarios conectados:{numUsuariosRegistrados}</i>
      <i className='h-20 w-fit'>usuarios registrados:{usuarios.length}</i>
       <div className='flex flex-col gap-5 w-full h-4/5 bg-red-100 '>
        <h2 className='bg-green-100 h-16 text-center pt-2'>{isConnect ? "EN LINEA": "DESCONECTADO"}</h2>
          
        <div className='flex z-10 relative top-10 justify-start pl-10 pr-10 h-full overflow-hidden'>
          

                  <ul className='flex flex-col items-center pl-2 gap-5 w-full' style={{ maxHeight: '500px', overflow:'auto'}}>
                    {
                      message.map((mensaje, index) => (
                        <li key={index} className='bg-blue-100 h-10 rounded-md shadow w-full'>
                          {mensaje.usuario}:{mensaje.mensaje}
                        </li>
                      ))}
                  </ul>
                      
                </div>
             
       </div>
        <div className='flex gap-1 absolute  w-full h-full items-end justify-center '> 
          <input 
          onChange={e=> SetNewMessage(e.target.value)}
          className='w-full p-2 border-black border' type="text" placeholder='escribe un mensaje...' />
          <button 
          onClick={enviarMensajes}
          className='bg-blue-200 w-44 h-10 shadow'>enviar</button>
        </div>
      </div>
      ):(
      <>
      <div className=' bg-green-200 shadow rounded-md w-2/4 h-2/4 '>
          <form className='h-full gap-5 items-center justify-center w-full flex flex-col' action="">
          <h2 className='text-xl font-bold border-b border-black'>Inicia Sesion</h2>
          <input name="usuario" value={formData.usuario} onChange={handleChange} className='w-2/4 p-2 border-black border rounded-md ' type='text' placeholder='Nombre' />
          <input  name="correo" value={formData.correo} onChange={handleChange} className='w-2/4 p-2 border-black border rounded-md ' type="email" placeholder='correo electronico' />
          <input  name="contraseña" value={formData.contraseña} onChange={handleChange} className='w-2/4 p-2 border-black border rounded-md ' type="password" placeholder='contraseña' />
          <button
          onClick={handleSumbit}
          type='submit'
          className='bg-blue-200 w-44 h-10 shadow rounded-md ' >registrarse</button>
          </form>
      </div>
      </>
      )
     }
    </div>
    
    </>
  )
}

export default chat