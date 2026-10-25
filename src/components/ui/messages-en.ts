import type { YugenMessages } from "./YugenProvider/context";
import {
  citationMessagesEn,
  promptInputMessagesEn,
  reasoningMessagesEn,
  streamingMarkdownMessagesEn,
} from "./AIKit/messages.en";
import { autocompleteMessagesEn } from "./Autocomplete/messages.en";
import { avatarGroupMessagesEn } from "./AvatarGroup/messages.en";
import { breadcrumbMessagesEn } from "./Breadcrumb/messages.en";
import { calendarMessagesEn } from "./Calendar/messages.en";
import { carouselMessagesEn } from "./Carousel/messages.en";
import { chartMessagesEn } from "./Chart/messages.en";
import {
  codeBlockMessagesEn,
  codeTabsMessagesEn,
  copyCodeButtonMessagesEn,
  packageManagerTabsMessagesEn,
} from "./CodeBlock/messages.en";
import { comboboxMessagesEn } from "./Combobox/messages.en";
import { commandMessagesEn } from "./Command/messages.en";
import { counterBadgeMessagesEn } from "./CounterBadge/messages.en";
import { dataGridMessagesEn } from "./DataGrid/messages.en";
import { datePickerMessagesEn, dateRangePickerMessagesEn } from "./DatePicker/messages.en";
import { dialogMessagesEn } from "./Dialog/messages.en";
import { fileUploadMessagesEn } from "./FileUpload/messages.en";
import { infoLabelMessagesEn } from "./InfoLabel/messages.en";
import { inputOTPMessagesEn } from "./InputOTP/messages.en";
import { linkMessagesEn } from "./Link/messages.en";
import {
  asyncContentMessagesEn,
  errorStateMessagesEn,
  loadingOverlayMessagesEn,
  optimisticListMessagesEn,
  pageProgressMessagesEn,
} from "./Loading/messages.en";
import { messageBarMessagesEn } from "./MessageBar/messages.en";
import {
  chatComposerMessagesEn,
  messageBubbleMessagesEn,
  messageScrollerMessagesEn,
  typingIndicatorMessagesEn,
} from "./MessageScroller/messages.en";
import { navMessagesEn } from "./Nav/messages.en";
import { notificationCenterMessagesEn } from "./NotificationCenter/messages.en";
import { paginationMessagesEn } from "./Pagination/messages.en";
import { presenceBadgeMessagesEn } from "./PresenceBadge/messages.en";
import { questionnaireMessagesEn } from "./Questionnaire/messages.en";
import { ratingMessagesEn } from "./Rating/messages.en";
import { resizableMessagesEn } from "./Resizable/messages.en";
import { searchBoxMessagesEn } from "./SearchBox/messages.en";
import { sheetMessagesEn } from "./Sheet/messages.en";
import { skeletonMessagesEn } from "./Skeleton/messages.en";
import { spinButtonMessagesEn } from "./SpinButton/messages.en";
import { spinnerMessagesEn } from "./Spinner/messages.en";
import { splitButtonMessagesEn } from "./SplitButton/messages.en";
import { stepperMessagesEn, wizardMessagesEn } from "./Stepper/messages.en";
import { swatchPickerMessagesEn } from "./SwatchPicker/messages.en";
import { tableMessagesEn } from "./Table/messages.en";
import { tagMessagesEn } from "./Tag/messages.en";
import { tagPickerMessagesEn } from "./TagPicker/messages.en";
import { teachingPopoverMessagesEn } from "./TeachingPopover/messages.en";
import { timePickerMessagesEn } from "./TimePicker/messages.en";
import { toastMessagesEn } from "./Toast/messages.en";
import { tourMessagesEn } from "./Tour/messages.en";
import { traceMessagesEn } from "./Trace/messages.en";

/**
 * Chuỗi giao diện có sẵn của mọi component, bằng tiếng Anh: `<YugenProvider messages={messagesEn} locale="en-US">`.
 * Kiểu `YugenMessages` đầy đủ: component mới thêm namespace mà quên bản tiếng Anh ở đây thì typecheck báo lỗi.
 */
export const messagesEn: YugenMessages = {
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
  combobox: comboboxMessagesEn,
  command: commandMessagesEn,
  copyCodeButton: copyCodeButtonMessagesEn,
  counterBadge: counterBadgeMessagesEn,
  dataGrid: dataGridMessagesEn,
  datePicker: datePickerMessagesEn,
  dateRangePicker: dateRangePickerMessagesEn,
  dialog: dialogMessagesEn,
  errorState: errorStateMessagesEn,
  fileUpload: fileUploadMessagesEn,
  infoLabel: infoLabelMessagesEn,
  inputOTP: inputOTPMessagesEn,
  link: linkMessagesEn,
  loadingOverlay: loadingOverlayMessagesEn,
  messageBar: messageBarMessagesEn,
  messageBubble: messageBubbleMessagesEn,
  messageScroller: messageScrollerMessagesEn,
  nav: navMessagesEn,
  notificationCenter: notificationCenterMessagesEn,
  optimisticList: optimisticListMessagesEn,
  packageManagerTabs: packageManagerTabsMessagesEn,
  pageProgress: pageProgressMessagesEn,
  pagination: paginationMessagesEn,
  presenceBadge: presenceBadgeMessagesEn,
  promptInput: promptInputMessagesEn,
  questionnaire: questionnaireMessagesEn,
  rating: ratingMessagesEn,
  reasoning: reasoningMessagesEn,
  resizable: resizableMessagesEn,
  searchBox: searchBoxMessagesEn,
  sheet: sheetMessagesEn,
  skeleton: skeletonMessagesEn,
  spinButton: spinButtonMessagesEn,
  spinner: spinnerMessagesEn,
  splitButton: splitButtonMessagesEn,
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
};
