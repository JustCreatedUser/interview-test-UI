import { useState } from "react";
import { OverflowList } from "react-responsive-overflow-list"
import { Link, useLocation } from "react-router";
import {useSortable} from '@dnd-kit/react/sortable';

type LinkContentType = {name: string, svg_name: string; path: string; id: number}
var navigationElements: LinkContentType[] = [
  { name: "Lagerverwaltung", svg_name: "fi-rs-box-alt" , path: "", id: 0},
  { name: "Dashboard", svg_name: "fi-rs-apps", path: "dashboard", id: 1 },
  { name: "Banking", svg_name: "fi-rs-bank", path: "banking" , id: 2},
  { name: "Telefonie", svg_name: "fi-rs-phone-call", path: "telefonie", id: 3},
  { name: "Accounting", svg_name: "fi-user-add", path: "accounting" , id: 4},
  { name: "Verkauf", svg_name: "fi-rs-shop", path: "shopping" , id: 5},
  { name: "Statistik", svg_name: "fi-rs-chart-pie", path: "statistics" , id: 6},
  { name: "Post Office", svg_name: "fi-rs-envelope", path: "post-office" , id: 7},
  { name: "Administration", svg_name: "fi-rs-setting", path: "administration" , id: 8},
  { name: "Help", svg_name: "fi-rs-cube", path: "help" , id: 9},
  { name: "Warenbestand", svg_name: "fi-rs-cube", path: "inventory" , id: 10},
  { name: "Auswahllisten", svg_name: "fi-rs-list", path: "selection", id: 11},
]
function restoreSavedNavOrder(): number[] | null {
  var savedOrder = localStorage.getItem("items-order");
  if(
    !savedOrder
    ||savedOrder[0]!='['
    ||savedOrder[savedOrder.length-1]!=']'
  ) return null;
  try {
    var parsedSavedOrder = JSON.parse(savedOrder) as any[];
  } catch { return null}
  if(parsedSavedOrder.length!=savedOrder.length) return null;
  var set = new Set();
  for (var el of parsedSavedOrder) {
    if(typeof el != "number" || el < 0 || el > savedOrder.length - 1) return null;
    set.add(el);
  }
  if(set.size != savedOrder.length) return null;
  return parsedSavedOrder;
};
var navigationOrder: number[] = restoreSavedNavOrder() || [...new Array(navigationElements.length).keys()]; 
console.log(navigationOrder)
function replaceCurrentLink(orderedLinks: number[], setLinks: (links: number[])=>void, link: number) {
  var newArr: number[] = [link];
  for(var el of orderedLinks) {
    if(el==link) continue;
    newArr.push(el)
  } 
  console.log(orderedLinks, newArr)
  setLinks(newArr)
}
function overflowButton(orderedLinks: number[], items: number[], setLinks: (args: number[])=>void) {
  var [visible, setVisible] = useState(false)
  setPopupVisible = setVisible;
  return (
    <>
    <button className="w-9 flex items-center cursor-pointer justify-center bg-blue h-full text-white" style={
      { position: "absolute", right: 0 }} onClick={() => {
        setVisible(!visible)
      }}
    >
      <p style={ { height: 14, } }>^</p>
    </button>
    <ul className="absolute flex-col min-w-10 right-0 top-12.5 bg-primary border border-gray-lightest" style={{display: visible ? "flex" : "none"}}>
      {items.map((linkIndex)=>{
        var item = navigationElements[linkIndex]
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
var setPopupVisible: any;
export default function() {
  var location = useLocation();
  var {0:orderedLinks,1:setLinks} = useState(navigationOrder);
  return (
    <OverflowList
      items={orderedLinks}
      renderItem={
        (elIndex, indexIndex) => {
          var item = navigationElements[elIndex]
          const isActive = location.pathname === "/" + item.path;
          var {ref} = useSortable({id: item.id, index: indexIndex })
          return <Link
            ref={ref}
            key={item.name}
            className={"nav-el" + (isActive ? " nav-el-active" : "")}
            to={"/" + item.path}
            onClick={()=>{ setPopupVisible(false) }}
          >
            <img src={"/nav-icons/" + item.svg_name + ".svg"} />
            <p>{item.name}</p>
          </Link>
        }
      }
      style={
        { width: "100%", display: "flex", alignItems: "center", height: "100%", position: "relative" }
      }
      maxRows={1}
      renderOverflow={(items)=>overflowButton(orderedLinks, items, setLinks)}
    >
    </OverflowList>
  )
}
