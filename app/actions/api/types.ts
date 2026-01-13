interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface DotTypeCounts {
  [key: string]: string; // dynamic keys with string values
}

interface UserMostDotSummary {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  total_dots: number;
  thumbs_up_count: number;
  ok_count: number;
  loop_count: number;
  is_active: boolean;
}

interface AttributeSummary {
  label_text: string;
  category_name: string;
  total_count: number;
  thumbs_up_count: number;
  ok_count: number;
  loop_count: number;
}

interface DotDetail {
  id: number;
  label_id: number;
  dot_type_name: string;
}

interface DotRecord {
  id: number;
  giver_name: string;
  receiver_name: string;
  giver_id: number;
  receiver_id: number;
  comment: string;
  details: DotDetail[];
  created_at: string; // ISO date string
}

interface UserDotsSummary {
  total_dots_given: number;
  total_dots_received: number;
  dots_given_by_type: DotTypeCounts;
  dots_received_by_type: DotTypeCounts;
  last_dot_given: string; // ISO date string
  last_dot_received: string; // ISO date string
  most_dots_received_from: UserMostDotSummary[];
  most_dots_given_to: UserMostDotSummary[];
  top_attributes_received: AttributeSummary[];
  top_attributes_given: AttributeSummary[];
  dots_received_details: DotRecord[];
  dots_given_details: DotRecord[];
}

interface DotDetail {
  id: number;
  label_id: number;
  dot_type_name: string;
}

export interface DotQuality {
  dot_quality: "good" | "bad" | null;
}

export interface DotDetailedResult {
  id: number;
  giver_name: string;
  dot_quality: DotQuality["dot_quality"];
  receiver_name: string;
  giver_id: number;
  giver_is_active: boolean;
  receiver_id: number;
  receiver_is_active: boolean;
  comment: string;
  details: DotDetail[];
  created_at: string; // ISO date string
}

interface DotDetailedBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: DotDetailedResult[];
}

type ReceivedDotDetailed = DotDetailedBase | null;
type GivenDotDetailed = DotDetailedBase | null;

export interface DotLabel {
  id: number;
  label: string;
}

interface DotCategory {
  id: number;
  name: string;
  labels: DotLabel[];
}

interface OtherUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  dots_given: number;
  dots_received: number;
  is_active: boolean;
}
interface UserForAdmin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  dots_given: number;
  dots_received: number;
  date_joined: string; // ISO date string
  last_login: string; // ISO date string
}

export type {
  User,
  UserMostDotSummary,
  AttributeSummary,
  UserDotsSummary,
  DotDetail,
  ReceivedDotDetailed,
  GivenDotDetailed,
  DotCategory,
  OtherUser,
  UserForAdmin,
};
