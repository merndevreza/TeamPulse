export type DotsDataType = {
   activity: {
      not_giving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[],
      giving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[],
      not_receiving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[],
      receiving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[]
   },
   monthlyActivity: {
      fewerDotGivers?: { user_id: number, first_name: string, last_name: string, dots_given: number }[],
      mostDotGivers?: { user_id: number, first_name: string, last_name: string, dots_given: number }[],
      fewerDotReceivers?: { user_id: number, first_name: string, last_name: string, dots_received: number }[],
      mostDotReceivers?: { user_id: number, first_name: string, last_name: string, dots_received: number }[],
   },
   feedbackType: {
      thumbs_up: { user_id: number, first_name: string, last_name: string, thumbs_up_percentage: number, loop_percentage: number, ok_percentage: number, total_dots: number }[],
      loop: { user_id: number, first_name: string, last_name: string, thumbs_up_percentage: number, loop_percentage: number, ok_percentage: number, total_dots: number }[]
   }
}