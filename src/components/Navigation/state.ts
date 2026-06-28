var STORAGE_NAV_ORDER = "items-order"
type LinkContentType = {name: string, svg_name: string; path: string; id: number}
var overflowPopupState: {visibility: boolean; setVisibility: (state: boolean)=>void } = {visibility: false, setVisibility(){this.visibility = true}}
var NAVIGATION_ELEMENTS: LinkContentType[] = [
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
export {
  STORAGE_NAV_ORDER,
  type LinkContentType,
  NAVIGATION_ELEMENTS,
  overflowPopupState
}
