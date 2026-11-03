import type { YugenMessages } from "./YugenProvider/context";
import {
  citationMessagesVi,
  promptInputMessagesVi,
  reasoningMessagesVi,
  streamingMarkdownMessagesVi,
} from "./AIKit/messages";
import { appShellMessagesVi } from "./AppShell/messages";
import { autocompleteMessagesVi } from "./Autocomplete/messages";
import { avatarGroupMessagesVi } from "./AvatarGroup/messages";
import { breadcrumbMessagesVi } from "./Breadcrumb/messages";
import { calendarMessagesVi } from "./Calendar/messages";
import { carouselMessagesVi } from "./Carousel/messages";
import { chartMessagesVi } from "./Chart/messages";
import {
  codeBlockMessagesVi,
  codeTabsMessagesVi,
  copyCodeButtonMessagesVi,
  packageManagerTabsMessagesVi,
} from "./CodeBlock/messages";
import { comboboxMessagesVi } from "./Combobox/messages";
import { commandMessagesVi } from "./Command/messages";
import { counterBadgeMessagesVi } from "./CounterBadge/messages";
import { dataGridMessagesVi } from "./DataGrid/messages";
import { datePickerMessagesVi, dateRangePickerMessagesVi } from "./DatePicker/messages";
import { descriptionListMessagesVi } from "./DescriptionList/messages";
import { dialogMessagesVi } from "./Dialog/messages";
import { fileUploadMessagesVi } from "./FileUpload/messages";
import { infoLabelMessagesVi } from "./InfoLabel/messages";
import { inputOTPMessagesVi } from "./InputOTP/messages";
import { linkMessagesVi } from "./Link/messages";
import {
  asyncContentMessagesVi,
  errorStateMessagesVi,
  loadingOverlayMessagesVi,
  optimisticListMessagesVi,
  pageProgressMessagesVi,
} from "./Loading/messages";
import { markdownMessagesVi } from "./Markdown/messages";
import { messageBarMessagesVi } from "./MessageBar/messages";
import {
  chatComposerMessagesVi,
  messageBubbleMessagesVi,
  messageScrollerMessagesVi,
  typingIndicatorMessagesVi,
} from "./MessageScroller/messages";
import { navMessagesVi } from "./Nav/messages";
import { notificationCenterMessagesVi } from "./NotificationCenter/messages";
import { paginationMessagesVi } from "./Pagination/messages";
import { presenceBadgeMessagesVi } from "./PresenceBadge/messages";
import { questionnaireMessagesVi } from "./Questionnaire/messages";
import { ratingMessagesVi } from "./Rating/messages";
import { resizableMessagesVi } from "./Resizable/messages";
import { searchBoxMessagesVi } from "./SearchBox/messages";
import { sheetMessagesVi } from "./Sheet/messages";
import { skeletonMessagesVi } from "./Skeleton/messages";
import { sonnerMessagesVi } from "./Sonner/messages";
import { sortableMessagesVi } from "./Sortable/messages";
import { spinButtonMessagesVi } from "./SpinButton/messages";
import { spinnerMessagesVi } from "./Spinner/messages";
import { statMessagesVi } from "./Stat/messages";
import { splitButtonMessagesVi } from "./SplitButton/messages";
import { stepperMessagesVi, wizardMessagesVi } from "./Stepper/messages";
import { swatchPickerMessagesVi } from "./SwatchPicker/messages";
import { tableMessagesVi } from "./Table/messages";
import { tagMessagesVi } from "./Tag/messages";
import { tagPickerMessagesVi } from "./TagPicker/messages";
import { teachingPopoverMessagesVi } from "./TeachingPopover/messages";
import { timePickerMessagesVi } from "./TimePicker/messages";
import { toastMessagesVi } from "./Toast/messages";
import { tourMessagesVi } from "./Tour/messages";
import { traceMessagesVi } from "./Trace/messages";

/**
 * Chuỗi giao diện có sẵn của mọi component, bằng tiếng Việt: `<YugenProvider messages={messagesVi} locale="vi-VN">`.
 * Mặc định là tiếng Anh (`messagesEn`). Kiểu `YugenMessages` đầy đủ: component mới thêm namespace mà quên bản tiếng Việt ở
 * đây thì typecheck báo lỗi.
 */
export const messagesVi: YugenMessages = {
  appShell: appShellMessagesVi,
  asyncContent: asyncContentMessagesVi,
  autocomplete: autocompleteMessagesVi,
  avatarGroup: avatarGroupMessagesVi,
  breadcrumb: breadcrumbMessagesVi,
  calendar: calendarMessagesVi,
  carousel: carouselMessagesVi,
  chart: chartMessagesVi,
  chatComposer: chatComposerMessagesVi,
  citation: citationMessagesVi,
  codeBlock: codeBlockMessagesVi,
  codeTabs: codeTabsMessagesVi,
  combobox: comboboxMessagesVi,
  command: commandMessagesVi,
  copyCodeButton: copyCodeButtonMessagesVi,
  counterBadge: counterBadgeMessagesVi,
  dataGrid: dataGridMessagesVi,
  datePicker: datePickerMessagesVi,
  dateRangePicker: dateRangePickerMessagesVi,
  descriptionList: descriptionListMessagesVi,
  dialog: dialogMessagesVi,
  errorState: errorStateMessagesVi,
  fileUpload: fileUploadMessagesVi,
  infoLabel: infoLabelMessagesVi,
  inputOTP: inputOTPMessagesVi,
  link: linkMessagesVi,
  loadingOverlay: loadingOverlayMessagesVi,
  markdown: markdownMessagesVi,
  messageBar: messageBarMessagesVi,
  messageBubble: messageBubbleMessagesVi,
  messageScroller: messageScrollerMessagesVi,
  nav: navMessagesVi,
  notificationCenter: notificationCenterMessagesVi,
  optimisticList: optimisticListMessagesVi,
  packageManagerTabs: packageManagerTabsMessagesVi,
  pageProgress: pageProgressMessagesVi,
  pagination: paginationMessagesVi,
  presenceBadge: presenceBadgeMessagesVi,
  promptInput: promptInputMessagesVi,
  questionnaire: questionnaireMessagesVi,
  rating: ratingMessagesVi,
  reasoning: reasoningMessagesVi,
  resizable: resizableMessagesVi,
  searchBox: searchBoxMessagesVi,
  sheet: sheetMessagesVi,
  skeleton: skeletonMessagesVi,
  sonner: sonnerMessagesVi,
  sortable: sortableMessagesVi,
  spinButton: spinButtonMessagesVi,
  spinner: spinnerMessagesVi,
  splitButton: splitButtonMessagesVi,
  stat: statMessagesVi,
  stepper: stepperMessagesVi,
  streamingMarkdown: streamingMarkdownMessagesVi,
  swatchPicker: swatchPickerMessagesVi,
  table: tableMessagesVi,
  tag: tagMessagesVi,
  tagPicker: tagPickerMessagesVi,
  teachingPopover: teachingPopoverMessagesVi,
  timePicker: timePickerMessagesVi,
  toast: toastMessagesVi,
  tour: tourMessagesVi,
  trace: traceMessagesVi,
  typingIndicator: typingIndicatorMessagesVi,
  wizard: wizardMessagesVi,
};
