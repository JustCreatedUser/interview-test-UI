import { useState } from "react";
import { NAVIGATION_ELEMENTS, STORAGE_NAV_ORDER, overflowPopupState} from "./state";
import { Link } from "react-router";

function replaceCurrentLink(orderedLinks: number[], setLinks: (links: number[])=>void, link: number) {
  var newArr: number[] = [link];
  for(var el of orderedLinks) {
    if(el==link) continue;
    newArr.push(el)
  } 
  localStorage.setItem(STORAGE_NAV_ORDER, JSON.stringify(newArr));
  setLinks(newArr)
}
export default function OverflowingLinks(orderedLinks: number[], items: number[], setLinks: (args: number[])=>void) {
  var [visibility, setVisible] = useState(false)
  overflowPopupState.visibility = visibility;
  overflowPopupState.setVisibility = setVisible;
  return (
    <>
    <button className="w-9 flex items-center cursor-pointer justify-center bg-blue h-full text-white" style={
      { position: "absolute", right: 0 }} onClick={() => {
        setVisible(!visibility)
      }}
    >
      <p style={ { height: 14, } }>^</p>
    </button>
    <ul className="absolute flex-col min-w-10 right-0 top-12.5 bg-primary border border-gray-lightest" style={{display: visibility ? "flex" : "none"}}>
      {items.map((linkIndex)=>{
        var item = NAVIGATION_ELEMENTS[linkIndex]
        const isActive = location.pathname === "/" + item.path;
        return <Link
          key={item.name}
          className={"nav-el" + (isActive ? " nav-el-active" : "")}
          to={"/" + item.path}
          style={{paddingBlock: "10px"}}
          onClick={()=>{
            replaceCurrentLink(orderedLinks, setLinks, linkIndex)
          }}
        >
          <img src={"/nav-icons/" + item.svg_name + ".svg"} />
          <p>{item.name}</p>
        </Link>
      })}
    </ul>
    </>
  )
}

