import { useState } from "react";
import { OverflowList } from "react-responsive-overflow-list"
import { Link, useLocation } from "react-router";
import {useDroppable} from '@dnd-kit/react';

type LinkContentType = {name: string, svg_name: string; path: string}
var navigationElements: LinkContentType[] = [
  { name: "Lagerverwaltung", svg_name: "fi-rs-box-alt" , path: ""},
  { name: "Dashboard", svg_name: "fi-rs-apps", path: "dashboard" },
  { name: "Banking", svg_name: "fi-rs-bank", path: "banking" },
  { name: "Telefonie", svg_name: "fi-rs-phone-call", path: "telefonie"},
  { name: "Accounting", svg_name: "fi-user-add", path: "accounting" },
  { name: "Verkauf", svg_name: "fi-rs-shop", path: "shopping" },
  { name: "Statistik", svg_name: "fi-rs-chart-pie", path: "statistics" },
  { name: "Post Office", svg_name: "fi-rs-envelope", path: "post-office" },
  { name: "Administration", svg_name: "fi-rs-setting", path: "administration" },
  { name: "Help", svg_name: "fi-rs-cube", path: "help" },
  { name: "Warenbestand", svg_name: "fi-rs-cube", path: "inventory" },
  { name: "Auswahllisten", svg_name: "fi-rs-list", path: "selection"},
]
function replaceCurrentLink(setLinks: (links: typeof navigationElements)=>void, link: LinkContentType) {
  var newArr: LinkContentType[] = [link];
  for(var el of navigationElements) {
    if(el==link) continue;
    newArr.push(el)
  } 
  setLinks(newArr)
}
function overflowButton(items: typeof navigationElements, setLinks: (args: LinkContentType[])=>void) {
  var [visible, setVisible] = useState(false)
  setPopupVisible = setVisible;
  return (
    <>
    <button className="w-9 flex items-center cursor-pointer justify-center bg-blue h-full text-white" style={
      { position: "absolute", right: 0 }} onClick={() => {
        setVisible(!visible)
      }}
    >
      <p style={
        {
          height: 14,
        }
      }>^</p>
    </button>
    { 
    <ul className="absolute flex-col min-w-10 right-0 top-12.5 bg-primary border border-gray-lightest" style={{display: visible ? "flex" : "none"}}>
      {items.map((item)=>{
          const isActive = location.pathname === "/" + item.path;
          return <Link
            className={"nav-el" + (isActive ? " nav-el-active" : "")}
            to={"/" + item.path}
            style={{paddingBlock: "10px"}}
            onClick={()=>{
              replaceCurrentLink(setLinks, item)
            }}
          >
            <img src={"public/nav-icons/" + item.svg_name + ".svg"} />
            <p>{item.name}</p>
          </Link>
      })}
    </ul>}
    </>
  )
}
var setPopupVisible: any;
export default function({id}: any) {
  var location = useLocation();
  var {0:orderedLinks,1:setLinks} = useState(navigationElements);
  const {ref} = useDroppable({id})
  return (
    <OverflowList
      items={orderedLinks}
      ref={ref}
      renderItem={
        (item) => {
          const isActive = location.pathname === "/" + item.path;
          return <Link
            className={"nav-el" + (isActive ? " nav-el-active" : "")}
            to={"/" + item.path}
            onClick={()=>{ setPopupVisible(false) }}
          >
            <img src={"public/nav-icons/" + item.svg_name + ".svg"} />
            <p>{item.name}</p>
          </Link>
        }
      }
      style={
        { width: "100%", display: "flex", alignItems: "center", height: "100%", position: "relative" }
      }
      maxRows={1}
      renderOverflow={(items)=>overflowButton(items, setLinks)}
    >
    </OverflowList>
  )
}
