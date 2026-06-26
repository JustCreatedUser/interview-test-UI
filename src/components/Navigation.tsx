import { useState, useCallback, useRef, useEffect } from "react";
import { OverflowList } from "react-responsive-overflow-list";
import { Link, useLocation } from "react-router";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type LinkContentType = { name: string; svg_name: string; path: string };

const DEFAULT_NAV_ITEMS: LinkContentType[] = [
  { name: "Lagerverwaltung", svg_name: "fi-rs-box-alt", path: "" },
  { name: "Dashboard", svg_name: "fi-rs-apps", path: "dashboard" },
  { name: "Banking", svg_name: "fi-rs-bank", path: "banking" },
  { name: "Telefonie", svg_name: "fi-rs-phone-call", path: "telefonie" },
  { name: "Accounting", svg_name: "fi-rs-user-add", path: "accounting" },
  { name: "Verkauf", svg_name: "fi-rs-shop", path: "shopping" },
  { name: "Statistik", svg_name: "fi-rs-chart-pie", path: "statistics" },
  { name: "Post Office", svg_name: "fi-rs-envelope", path: "post-office" },
  { name: "Administration", svg_name: "fi-rs-settings", path: "administration" },
  { name: "Help", svg_name: "fi-rs-cube", path: "help" },
  { name: "Warenbestand", svg_name: "fi-rs-cube", path: "inventory" },
  { name: "Auswahllisten", svg_name: "fi-rs-list", path: "selection" },
];

const STORAGE_KEY = "nav-order";

function loadNavItems(): LinkContentType[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_NAV_ITEMS;
    const paths: string[] = JSON.parse(stored);
    const byPath = Object.fromEntries(DEFAULT_NAV_ITEMS.map((i) => [i.path, i]));
    const reordered = paths.map((p) => byPath[p]).filter(Boolean);
    const missing = DEFAULT_NAV_ITEMS.filter((i) => !paths.includes(i.path));
    return [...reordered, ...missing];
  } catch {
    return DEFAULT_NAV_ITEMS;
  }
}

function saveNavItems(items: LinkContentType[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((i) => i.path)));
}

// --- Sortable nav item (visible list) ---

type SortableNavItemProps = {
  item: LinkContentType;
  isActive: boolean;
  onClosePopup: () => void;
};

function SortableNavItem({ item, isActive, onClosePopup }: SortableNavItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.path });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: "grab",
  };

  return (
    <Link
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={"nav-el" + (isActive ? " nav-el-active" : "")}
      to={"/" + item.path}
      onClick={onClosePopup}
    >
      <img src={"public/nav-icons/" + item.svg_name + ".svg"} />
      <p>{item.name}</p>
    </Link>
  );
}

// --- Overflow item (draggable only, not sortable among siblings) ---

type OverflowNavItemProps = {
  item: LinkContentType;
  isActive: boolean;
  onLinkClick: () => void;
};

function OverflowNavItem({ item, isActive, onLinkClick }: OverflowNavItemProps) {
  // Still use useSortable so dnd-kit tracks it as a draggable with an id,
  // but we suppress the sorting transform to prevent reordering within overflow.
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: item.path,
  });

  return (
    <Link
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={"nav-el" + (isActive ? " nav-el-active" : "")}
      to={"/" + item.path}
      style={{ paddingBlock: "10px", opacity: isDragging ? 0.4 : 1, cursor: "grab" }}
      onClick={onLinkClick}
    >
      <img src={"public/nav-icons/" + item.svg_name + ".svg"} />
      <p>{item.name}</p>
    </Link>
  );
}

// --- Overflow button + popup ---

type OverflowButtonProps = {
  items: LinkContentType[];
  visible: boolean;
  onToggle: () => void;
  onLinkClick: () => void;
};

function OverflowButton({ items, visible, onToggle, onLinkClick }: OverflowButtonProps) {
  const location = useLocation();

  return (
    <>
      <button
        className="w-9 flex items-center cursor-pointer justify-center bg-blue h-full text-white"
        style={{ position: "absolute", right: 0 }}
        onClick={onToggle}
      >
        <p style={{ height: 14 }}>^</p>
      </button>
      <ul
        className="absolute flex-col min-w-10 right-0 top-12.5 bg-primary border border-gray-lightest"
        style={{ display: visible ? "flex" : "none" }}
      >
        {items.map((item) => {
          const isActive = location.pathname === "/" + item.path;
          return (
            <OverflowNavItem
              key={item.path}
              item={item}
              isActive={isActive}
              onLinkClick={onLinkClick}
            />
          );
        })}
      </ul>
    </>
  );
}

// --- Drag overlay ghost ---

function NavItemGhost({ item }: { item: LinkContentType }) {
  return (
    <div className="nav-el" style={{ cursor: "grabbing", opacity: 0.9 }}>
      <img src={"public/nav-icons/" + item.svg_name + ".svg"} />
      <p>{item.name}</p>
    </div>
  );
}

// --- Main component ---

export default function NavigationHeader({ id }: { id: string }) {
  const location = useLocation();
  const [navItems, setNavItems] = useState<LinkContentType[]>(loadNavItems);
  const [popupVisible, setPopupVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<LinkContentType | null>(null);

  // We need a ref to the current navItems inside dnd callbacks to avoid stale closure
  const navItemsRef = useRef(navItems);
  useEffect(() => { navItemsRef.current = navItems; }, [navItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const updateItems = useCallback((items: LinkContentType[]) => {
    setNavItems(items);
    saveNavItems(items);
  }, []);

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const item = navItemsRef.current.find((i) => i.path === active.id);
    setActiveItem(item ?? null);
  }, []);

  const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;

    const items = navItemsRef.current;
    const fromIndex = items.findIndex((i) => i.path === active.id);
    const toIndex = items.findIndex((i) => i.path === over.id);

    // Only reorder if both are visible items (toIndex is a visible item).
    // Overflow items dragged over visible items: move them into that slot.
    if (fromIndex === -1 || toIndex === -1) return;

    updateItems(arrayMove(items, fromIndex, toIndex));
  }, [updateItems]);

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    setActiveItem(null);
    if (!over || active.id === over.id) return;

    const items = navItemsRef.current;
    const fromIndex = items.findIndex((i) => i.path === active.id);
    const toIndex = items.findIndex((i) => i.path === over.id);

    if (fromIndex === -1 || toIndex === -1) return;
    updateItems(arrayMove(items, fromIndex, toIndex));
  }, [updateItems]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={navItems.map((i) => i.path)}
        strategy={horizontalListSortingStrategy}
      >
        <OverflowList
          items={navItems}
          renderItem={(item) => {
            const isActive = location.pathname === "/" + item.path;
            return (
              <SortableNavItem
                key={item.path}
                item={item}
                isActive={isActive}
                onClosePopup={() => setPopupVisible(false)}
              />
            );
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            height: "100%",
            position: "relative",
          }}
          maxRows={1}
          renderOverflow={(items) => (
            <OverflowButton
              items={items}
              visible={popupVisible}
              onToggle={() => setPopupVisible((v) => !v)}
              onLinkClick={() => setPopupVisible(false)}
            />
          )}
        />
      </SortableContext>

      <DragOverlay>
        {activeItem ? <NavItemGhost item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
