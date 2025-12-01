"use client";
import {UserButton, useUser} from "@clerk/nextjs";


import { Laptop } from "lucide-react";


export default function DashboardHeader() {
  return(
    <div className='p-5  flex justify-end'>
        <UserButton />
    </div>
  )
}

