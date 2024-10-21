
import { Link } from "react-router-dom"
import { Web3Button } from '@web3modal/react'

// import airo from "../assets/icons/aarowgreen.svg"
// import logo from "../assets/icons/logo.webp"
const Navbar = () => {
    return (
        <>
            <div className="flex flex-wrap pt-5 px-5 justify-between items-center " >
                {/* <a href="/" className=" h-[3rem]  " >
                  <img loading="lazy" className="h-full w-full" src={logo} alt="" />
                 
              </a> */}

                



                
                <a href="/"  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        {/* <img loading="lazy" src={logo} width={82} height={82} alt="VOIP" /> */}
                        <h1 className=' text-4xl font-bold font-outfit  text-primary-gradient phone:text-xl ' >Voip Finance</h1>
                    </div>
                </a>

                <div className="flex" >
                    {/* <img  src={airo} className="w-[100px] h-[40px] phone:hidden  " alt="" /> */}
                    {/* <Link to="/" className=" btn2 bg-white w-fit text-white px-5 py-2   rounded-3xl " >   </Link> */}
                    <Web3Button />
                </div>

                

            </div>
        </>
    )
}

export default Navbar