import React from 'react'
import Logo from "../images/logo.png"
import Banner from "../images/banner.png"
import Image from 'next/image'

function LeftSide() {
  return (
    <div className=' w-full border-r justify-center text-center h-screen flex flex-col items-center bg-[#FFFDF4]'>
      <Image src={Logo} alt="" />
      <Image src={Banner} alt="" />
      <p>Quick virtual cards <br /> for future driven businesses & individuals.</p>
    </div>
  )
}

export default LeftSide