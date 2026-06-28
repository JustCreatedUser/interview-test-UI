import { useState } from "react";
import { OverflowList } from "react-responsive-overflow-list"
import { Link, useLocation } from "react-router";
import {useSortable} from '@dnd-kit/react/sortable';
import {STORAGE_NAV_ORDER as LOCALSTORAGE_NAV_ORDER, NAVIGATION_ELEMENTS, overflowPopupState} from "./state"
import OverflowingLinks from "./OverflowingLinks";

function restoreSavedNavOrder(): number[] | null {
  var savedOrder = localStorage.getItem(LOCALSTORAGE_NAV_ORDER);
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
var navigationOrder: number[] = restoreSavedNavOrder() || [...new Array(NAVIGATION_ELEMENTS.length).keys()]; 
function VisibleLink(elIndex: number, indexIndex: number, locationPathname: string) {
  var item = NAVIGATION_ELEMENTS[elIndex]
  const isActive = locationPathname === "/" + item.path;
  var { ref } = useSortable({ id: item.id, index: indexIndex })
  return <Link
    ref={ref}
    key={item.name}
    className={"nav-el" + (isActive ? " nav-el-active" : "")}
    to={"/" + item.path}
    onClick={() => { overflowPopupState.setVisibility(false) }}
  >
    <img src={"/nav-icons/" + item.svg_name + ".svg"} />
    <p>{item.name}</p>
  </Link>
}
export default function Navigation() {
  var location = useLocation();
  var {0:orderedLinks,1:setLinks} = useState(navigationOrder);
  return (
    <nav aria-label="Primary navigation" className="h-full flex items-center">
      <OverflowList
        items={orderedLinks}
        renderItem={(elIndex, indexIndex) => VisibleLink(elIndex, indexIndex, location.pathname)}
        style={
          { width: "100%", display: "flex", alignItems: "center", height: "100%", position: "relative" }
        }
        maxRows={1}
        renderOverflow={(items) => OverflowingLinks(orderedLinks, items, setLinks)}
      >
      </OverflowList>
    </nav>
  )
}
