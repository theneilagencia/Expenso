/**
 * FontAwesome Icons Import (Free Edition)
 *
 * Adapted from BTS Design System Pro icons to use FontAwesome Free.
 * Icons available in Free Solid and Free Regular are imported here.
 */

import { library } from '@fortawesome/fontawesome-svg-core'

// ============================================
// SOLID ICONS (fas) - FontAwesome Free
// ============================================
import {
  faHouse,
  faClock,
  faFolder,
  faFolderOpen,
  faCircleQuestion,
  faMagnifyingGlass,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronRight,
  faGear,
  faBars,
  faGaugeHigh,
  faListCheck,
  faArrowsRotate,

  faUser,
  faUsers,
  faUserPlus,
  faCircleUser,
  faHeadset,
  faHandshake,

  faBuilding,
  faBriefcase,
  faGavel,
  faLandmark,
  faChartColumn,
  faChartLine,
  faChartPie,
  faChartBar,
  faDollarSign,
  faBook,
  faShieldHalved,
  faCalculator,
  faRobot,
  faScaleBalanced,

  faFile,
  faFileLines,
  faClipboardList,
  faPaperclip,
  faCloudArrowUp,
  faFileArrowUp,
  faInbox,
  faBoxArchive,
  faBoxOpen,
  faTag,
  faList,
  faEnvelopeOpen,
  faFilePdf,
  faFileImage,
  faFileZipper,

  faPlus,
  faCirclePlus,
  faPen,
  faTrash,
  faFloppyDisk,
  faRotate,
  faXmark,
  faTrashCan,
  faCheck,
  faClipboardCheck,
  faPaperPlane,
  faEye,
  faEyeSlash,
  faLink,
  faRightLeft,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faUpload,
  faCopy,
  faSort,
  faArrowsLeftRight,

  faCalendar,
  faBell,
  faLightbulb,
  faCalendarCheck,
  faClockRotateLeft,

  faLock,
  faLockOpen,
  faBan,
  faArrowRightFromBracket,
  faGlobe,

  faEnvelope,
  faPhone,
  faLanguage,
  faComment,

  faPlay,
  faCirclePlay,
  faGraduationCap,
  faArrowUpRightFromSquare,

  faBold,
  faItalic,
  faListUl,
  faListOl,
  faHeading,

  faFileContract,
  faPenToSquare,
  faTruck,

  faFilter,
  faPercent,
  faArrowTrendUp,
  faArrowTrendDown,
  faDownload,
  faTimeline,
} from '@fortawesome/free-solid-svg-icons'

// ============================================
// REGULAR ICONS (far) - FontAwesome Free
// (Limited subset available in Free)
// ============================================
import {
  faUser as faUserRegular,
  faCircle as faCircleRegular,
  faEnvelope as faEnvelopeRegular,
  faBell as faBellRegular,
  faFile as faFileRegular,
  faFileLines as faFileLinesRegular,
  faFolder as faFolderRegular,
  faFolderOpen as faFolderOpenRegular,
  faCalendar as faCalendarRegular,
  faClock as faClockRegular,
  faComment as faCommentRegular,
  faCircleCheck as faCircleCheckRegular,
  faCircleXmark as faCircleXmarkRegular,
  faEye as faEyeRegular,
  faEyeSlash as faEyeSlashRegular,
  faTrashCan as faTrashCanRegular,
  faCopy as faCopyRegular,
  faFloppyDisk as faFloppyDiskRegular,
  faPenToSquare as faPenToSquareRegular,
  faLightbulb as faLightbulbRegular,
  faCircleQuestion as faCircleQuestionRegular,
} from '@fortawesome/free-regular-svg-icons'

// ============================================
// REGISTER
// ============================================
export function registerIcons() {
  // Solid icons
  library.add(
    faHouse, faClock, faTimeline, faFolder, faFolderOpen, faCircleQuestion,
    faMagnifyingGlass, faArrowLeft, faArrowRight, faArrowUp, faArrowDown,
    faChevronDown, faChevronUp, faChevronLeft, faChevronRight, faGear,
    faBars, faGaugeHigh, faListCheck, faArrowsRotate,
    faUser, faUsers, faUserPlus, faCircleUser, faHeadset, faHandshake,
    faBuilding, faBriefcase, faGavel, faLandmark, faChartColumn, faChartLine,
    faChartPie, faChartBar, faDollarSign, faBook, faShieldHalved, faCalculator,
    faRobot, faScaleBalanced,
    faFile, faFileLines, faClipboardList, faPaperclip, faCloudArrowUp,
    faFileArrowUp, faInbox, faBoxArchive, faBoxOpen, faTag, faList,
    faEnvelopeOpen, faFilePdf, faFileImage, faFileZipper,
    faPlus, faCirclePlus, faPen, faTrash, faFloppyDisk, faRotate, faXmark,
    faTrashCan, faCheck, faClipboardCheck, faPaperPlane, faEye, faEyeSlash,
    faLink, faRightLeft, faCircleCheck, faCircleXmark, faTriangleExclamation,
    faCircleInfo, faUpload, faCopy, faSort, faArrowsLeftRight,
    faCalendar, faBell, faLightbulb, faCalendarCheck, faClockRotateLeft,
    faLock, faLockOpen, faBan, faArrowRightFromBracket, faGlobe,
    faEnvelope, faPhone, faLanguage, faComment,
    faPlay, faCirclePlay, faGraduationCap, faArrowUpRightFromSquare,
    faBold, faItalic, faListUl, faListOl, faHeading,
    faFileContract, faPenToSquare, faTruck,
    faFilter, faPercent, faArrowTrendUp, faArrowTrendDown, faDownload,
  )

  // Regular icons (free subset)
  library.add(
    faUserRegular, faCircleRegular, faEnvelopeRegular, faBellRegular,
    faFileRegular, faFileLinesRegular, faFolderRegular, faFolderOpenRegular,
    faCalendarRegular, faClockRegular, faCommentRegular, faCircleCheckRegular,
    faCircleXmarkRegular, faEyeRegular, faEyeSlashRegular, faTrashCanRegular,
    faCopyRegular, faFloppyDiskRegular, faPenToSquareRegular,
    faLightbulbRegular, faCircleQuestionRegular,
  )
}

registerIcons()
