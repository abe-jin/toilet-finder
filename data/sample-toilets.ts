import type { Toilet } from "@/lib/types";

export const sampleToilets: Toilet[] = [
  {
    id: "sample-shinjuku-station-west",
    name: "新宿駅西口 公衆トイレ",
    address: "東京都新宿区西新宿1丁目",
    lat: 35.69056,
    lng: 139.69964,
    openingHours: "5:00 - 24:30",
    rating: 4.2,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "駅",
      free: true
    }
  },
  {
    id: "sample-shinjuku-gyoen",
    name: "新宿御苑 大木戸門トイレ",
    address: "東京都新宿区内藤町11",
    lat: 35.68886,
    lng: 139.71025,
    openingHours: "9:00 - 16:30",
    rating: 4.5,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: false,
      wheelchair: true,
      open24h: false,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-yoyogi-park",
    name: "代々木公園 中央広場トイレ",
    address: "東京都渋谷区代々木神園町2",
    lat: 35.67172,
    lng: 139.69494,
    openingHours: "24時間",
    rating: 4.0,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: false,
      washlet: false,
      wheelchair: true,
      open24h: true,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-tokyo-station",
    name: "東京駅 丸の内地下トイレ",
    address: "東京都千代田区丸の内1丁目",
    lat: 35.68124,
    lng: 139.76713,
    openingHours: "4:30 - 25:00",
    rating: 4.4,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "駅",
      free: true
    }
  },
  {
    id: "sample-hibiya-park",
    name: "日比谷公園 霞門トイレ",
    address: "東京都千代田区日比谷公園",
    lat: 35.67324,
    lng: 139.75514,
    openingHours: "24時間",
    rating: 3.9,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: false,
      washlet: false,
      wheelchair: true,
      open24h: true,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-shibuya-hikarie",
    name: "渋谷ヒカリエ 11Fトイレ",
    address: "東京都渋谷区渋谷2-21-1",
    lat: 35.65863,
    lng: 139.70303,
    openingHours: "11:00 - 23:00",
    rating: 4.7,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "商業施設",
      free: true
    }
  },
  {
    id: "sample-ueno-park",
    name: "上野公園 噴水前トイレ",
    address: "東京都台東区上野公園",
    lat: 35.71546,
    lng: 139.77324,
    openingHours: "24時間",
    rating: 3.8,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: false,
      wheelchair: true,
      open24h: true,
      category: "公園",
      free: true
    }
  },
  {
    id: "sample-roppongi-hills",
    name: "六本木ヒルズ ウェストウォークトイレ",
    address: "東京都港区六本木6-10-1",
    lat: 35.66044,
    lng: 139.72922,
    openingHours: "7:00 - 24:00",
    rating: 4.6,
    amenities: {
      genderSeparated: true,
      multipurpose: true,
      diaperChanging: true,
      washlet: true,
      wheelchair: true,
      open24h: false,
      category: "商業施設",
      free: true
    }
  },
  {
    id: "sample-omotesando-station",
    name: "表参道駅 改札外トイレ",
    address: "東京都港区北青山3丁目",
    lat: 35.66526,
    lng: 139.71259,
    openingHours: "5:00 - 24:30",
    rating: 4.1,
    amenities: {
      genderSeparated: true,
      multipurpose: false,
      diaperChanging: false,
      washlet: true,
      wheelchair: false,
      open24h: false,
      category: "駅",
      free: true
    }
  },
  {
    id: "sample-familymart-nishiazabu",
    name: "ファミリーマート 西麻布店トイレ",
    address: "東京都港区西麻布3丁目",
    lat: 35.65903,
    lng: 139.7235,
    openingHours: "24時間",
    rating: 3.7,
    amenities: {
      genderSeparated: false,
      multipurpose: false,
      diaperChanging: false,
      washlet: true,
      wheelchair: false,
      open24h: true,
      category: "コンビニ内",
      free: true
    }
  }
];
