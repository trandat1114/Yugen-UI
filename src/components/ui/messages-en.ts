import type { YugenMessages } from "./YugenProvider/context";
import {
  citationMessagesEn,
  promptInputMessagesEn,
  reasoningMessagesEn,
  streamingMarkdownMessagesEn,
} from "./AIKit/messages";
import { appShellMessagesEn } from "./AppShell/messages";
import { autocompleteMessagesEn } from "./Autocomplete/messages";
import { avatarGroupMessagesEn } from "./AvatarGroup/messages";
import { breadcrumbMessagesEn } from "./Breadcrumb/messages";
import { calendarMessagesEn } from "./Calendar/messages";
import { carouselMessagesEn } from "./Carousel/messages";
import { chartMessagesEn } from "./Chart/messages";
import {
  codeBlockMessagesEn,
  codeTabsMessagesEn,
  copyCodeButtonMessagesEn,
  packageManagerTabsMessagesEn,
} from "./CodeBlock/messages";
import { colorPickerMessagesEn } from "./ColorPicker/messages";
import { comboboxMessagesEn } from "./Combobox/messages";
import { commandMessagesEn } from "./Command/messages";
import { counterBadgeMessagesEn } from "./CounterBadge/messages";
import { dataGridMessagesEn } from "./DataGrid/messages";
import {
  datePickerMessagesEn,
  dateRangePickerMessagesEn,
  dateTimePickerMessagesEn,
  monthPickerMessagesEn,
  yearPickerMessagesEn,
} from "./DatePicker/messages";
import { descriptionListMessagesEn } from "./DescriptionList/messages";
import { dialogMessagesEn } from "./Dialog/messages";
import { fileUploadMessagesEn } from "./FileUpload/messages";
import { infoLabelMessagesEn } from "./InfoLabel/messages";
import { inputOTPMessagesEn } from "./InputOTP/messages";
import { linkMessagesEn } from "./Link/messages";
import {
  asyncContentMessagesEn,
  errorStateMessagesEn,
  loadingOverlayMessagesEn,
  optimisticListMessagesEn,
  pageProgressMessagesEn,
} from "./Loading/messages";
import { markdownMessagesEn } from "./Markdown/messages";
import { messageBarMessagesEn } from "./MessageBar/messages";
import {
  chatComposerMessagesEn,
  messageBubbleMessagesEn,
  messageScrollerMessagesEn,
  typingIndicatorMessagesEn,
} from "./MessageScroller/messages";
import { navMessagesEn } from "./Nav/messages";
import { notificationCenterMessagesEn } from "./NotificationCenter/messages";
import { paginationMessagesEn } from "./Pagination/messages";
import { passwordInputMessagesEn } from "./PasswordInput/messages";
import { presenceBadgeMessagesEn } from "./PresenceBadge/messages";
import { questionnaireMessagesEn } from "./Questionnaire/messages";
import { ratingMessagesEn } from "./Rating/messages";
import { resizableMessagesEn } from "./Resizable/messages";
import { searchBoxMessagesEn } from "./SearchBox/messages";
import { sheetMessagesEn } from "./Sheet/messages";
import { skeletonMessagesEn } from "./Skeleton/messages";
import { sonnerMessagesEn } from "./Sonner/messages";
import { sortableMessagesEn } from "./Sortable/messages";
import { spinButtonMessagesEn } from "./SpinButton/messages";
import { spinnerMessagesEn } from "./Spinner/messages";
import { statMessagesEn } from "./Stat/messages";
import { splitButtonMessagesEn } from "./SplitButton/messages";
import { stepperMessagesEn, wizardMessagesEn } from "./Stepper/messages";
import { swatchPickerMessagesEn } from "./SwatchPicker/messages";
import { tableMessagesEn } from "./Table/messages";
import { tagMessagesEn } from "./Tag/messages";
import { tagPickerMessagesEn } from "./TagPicker/messages";
import { teachingPopoverMessagesEn } from "./TeachingPopover/messages";
import { timePickerMessagesEn } from "./TimePicker/messages";
import { toastMessagesEn } from "./Toast/messages";
import { tourMessagesEn } from "./Tour/messages";
import { traceMessagesEn } from "./Trace/messages";

/**
 * Chuỗi giao diện có sẵn của mọi component, bằng tiếng Anh: đây cũng là giá trị mặc định khi không truyền `messages`.
 * Tiếng Việt: `messagesVi`. Kiểu `YugenMessages` đầy đủ: component mới thêm namespace mà quên bản tiếng Anh ở đây thì
 * typecheck báo lỗi.
 */
export const messagesEn: YugenMessages = {
  appShell: appShellMessagesEn,
  asyncContent: asyncContentMessagesEn,
  autocomplete: autocompleteMessagesEn,
  avatarGroup: avatarGroupMessagesEn,
  breadcrumb: breadcrumbMessagesEn,
  calendar: calendarMessagesEn,
  carousel: carouselMessagesEn,
  chart: chartMessagesEn,
  chatComposer: chatComposerMessagesEn,
  citation: citationMessagesEn,
  codeBlock: codeBlockMessagesEn,
  codeTabs: codeTabsMessagesEn,
  colorPicker: colorPickerMessagesEn,
  combobox: comboboxMessagesEn,
  command: commandMessagesEn,
  copyCodeButton: copyCodeButtonMessagesEn,
  counterBadge: counterBadgeMessagesEn,
  dataGrid: dataGridMessagesEn,
  datePicker: datePickerMessagesEn,
  dateRangePicker: dateRangePickerMessagesEn,
  dateTimePicker: dateTimePickerMessagesEn,
  descriptionList: descriptionListMessagesEn,
  dialog: dialogMessagesEn,
  errorState: errorStateMessagesEn,
  fileUpload: fileUploadMessagesEn,
  infoLabel: infoLabelMessagesEn,
  inputOTP: inputOTPMessagesEn,
  link: linkMessagesEn,
  loadingOverlay: loadingOverlayMessagesEn,
  markdown: markdownMessagesEn,
  messageBar: messageBarMessagesEn,
  messageBubble: messageBubbleMessagesEn,
  messageScroller: messageScrollerMessagesEn,
  monthPicker: monthPickerMessagesEn,
  nav: navMessagesEn,
  notificationCenter: notificationCenterMessagesEn,
  optimisticList: optimisticListMessagesEn,
  packageManagerTabs: packageManagerTabsMessagesEn,
  pageProgress: pageProgressMessagesEn,
  pagination: paginationMessagesEn,
  passwordInput: passwordInputMessagesEn,
  presenceBadge: presenceBadgeMessagesEn,
  promptInput: promptInputMessagesEn,
  questionnaire: questionnaireMessagesEn,
  rating: ratingMessagesEn,
  reasoning: reasoningMessagesEn,
  resizable: resizableMessagesEn,
  searchBox: searchBoxMessagesEn,
  sheet: sheetMessagesEn,
  skeleton: skeletonMessagesEn,
  sonner: sonnerMessagesEn,
  sortable: sortableMessagesEn,
  spinButton: spinButtonMessagesEn,
  spinner: spinnerMessagesEn,
  splitButton: splitButtonMessagesEn,
  stat: statMessagesEn,
  stepper: stepperMessagesEn,
  streamingMarkdown: streamingMarkdownMessagesEn,
  swatchPicker: swatchPickerMessagesEn,
  table: tableMessagesEn,
  tag: tagMessagesEn,
  tagPicker: tagPickerMessagesEn,
  teachingPopover: teachingPopoverMessagesEn,
  timePicker: timePickerMessagesEn,
  toast: toastMessagesEn,
  tour: tourMessagesEn,
  trace: traceMessagesEn,
  typingIndicator: typingIndicatorMessagesEn,
  wizard: wizardMessagesEn,
  yearPicker: yearPickerMessagesEn,
};
