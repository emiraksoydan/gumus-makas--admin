import type { IconType } from "react-icons";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineMapPin,
  HiOutlineUserCircle,
  HiOutlineCube,
  HiOutlineArchiveBox,
  HiOutlineTag,
  HiOutlineBookOpen,
  HiOutlineExclamationTriangle,
  HiOutlinePaperAirplane,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineStar,
  HiOutlineBolt,
  HiOutlineChatBubbleLeftRight,
  HiOutlineFolder,
  HiOutlineDocument,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineXMark,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlinePhoto,
  HiOutlineMusicalNote,
  HiOutlineFilm,
  HiOutlineSquares2X2,
  HiOutlineArrowDownTray,
  HiOutlineLink,
  HiOutlineBuildingStorefront,
  HiOutlineScissors,
  HiOutlineInbox,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCheckCircle,
  HiOutlineNoSymbol,
  HiOutlineMicrophone,
  HiOutlineGift,
} from "react-icons/hi2";
import { MdOutlineEventSeat, MdOutlineContentCut } from "react-icons/md";
import { TbRobot } from "react-icons/tb";

export type AppIconName =
  | "dashboard"
  | "users"
  | "calendar"
  | "map"
  | "freeBarber"
  | "business"
  | "store"
  | "chair"
  | "service"
  | "manuelBarber"
  | "category"
  | "help"
  | "complaint"
  | "request"
  | "blocked"
  | "admin"
  | "audit"
  | "roles"
  | "rating"
  | "favorite"
  | "chat"
  | "fileManager"
  | "savedFilter"
  | "search"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "close"
  | "plus"
  | "trash"
  | "eye"
  | "time"
  | "money"
  | "chart"
  | "image"
  | "audio"
  | "video"
  | "file"
  | "folder"
  | "grid"
  | "download"
  | "link"
  | "inbox"
  | "filter"
  | "check"
  | "ban"
  | "robot"
  | "microphone"
  | "package";

const ICON_MAP: Record<AppIconName, IconType> = {
  dashboard: HiOutlineHome,
  users: HiOutlineUsers,
  calendar: HiOutlineCalendar,
  map: HiOutlineMapPin,
  freeBarber: HiOutlineUserCircle,
  business: HiOutlineCube,
  store: HiOutlineBuildingStorefront,
  chair: MdOutlineEventSeat,
  service: MdOutlineContentCut,
  package: HiOutlineGift,
  manuelBarber: HiOutlineScissors,
  category: HiOutlineTag,
  help: HiOutlineBookOpen,
  complaint: HiOutlineExclamationTriangle,
  request: HiOutlinePaperAirplane,
  blocked: HiOutlineLockClosed,
  admin: HiOutlineShieldCheck,
  audit: HiOutlineClipboardDocumentList,
  roles: HiOutlineUsers,
  rating: HiOutlineStar,
  favorite: HiOutlineBolt,
  chat: HiOutlineChatBubbleLeftRight,
  fileManager: HiOutlineFolder,
  savedFilter: HiOutlineArchiveBox,
  search: HiOutlineMagnifyingGlass,
  chevronLeft: HiOutlineChevronLeft,
  chevronRight: HiOutlineChevronRight,
  chevronDown: HiOutlineChevronDown,
  close: HiOutlineXMark,
  plus: HiOutlinePlus,
  trash: HiOutlineTrash,
  eye: HiOutlineEye,
  time: HiOutlineClock,
  money: HiOutlineCurrencyDollar,
  chart: HiOutlineChartBar,
  image: HiOutlinePhoto,
  audio: HiOutlineMusicalNote,
  video: HiOutlineFilm,
  file: HiOutlineDocument,
  folder: HiOutlineFolder,
  grid: HiOutlineSquares2X2,
  download: HiOutlineArrowDownTray,
  link: HiOutlineLink,
  inbox: HiOutlineInbox,
  filter: HiOutlineAdjustmentsHorizontal,
  check: HiOutlineCheckCircle,
  ban: HiOutlineNoSymbol,
  robot: TbRobot,
  microphone: HiOutlineMicrophone,
};

export function getAppIcon(name: AppIconName): IconType {
  return ICON_MAP[name] ?? HiOutlineDocument;
}
