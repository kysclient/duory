import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "검색어를 입력해주세요" },
        { status: 400 }
      );
    }

    const kakaoApiKey = process.env.KAKAO_REST_API_KEY;

    if (!kakaoApiKey) {
      return NextResponse.json(
        { error: "카카오 API 설정이 필요합니다" },
        { status: 500 }
      );
    }

    // 카카오 로컬 API - 키워드로 장소 검색
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=15`,
      {
        headers: {
          Authorization: `KakaoAK ${kakaoApiKey}`,
          "KA": "sdk/1.0 os/javascript lang/ko-KR device/Server origin/localhost",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("카카오 API 오류:", errorData);
      throw new Error("카카오 API 호출 실패");
    }

    const data = await response.json();

    // 카카오 검색 결과를 우리 형식으로 변환
    const locations = data.documents.map((place: any) => ({
      name: place.place_name,
      address: place.address_name,
      roadAddress: place.road_address_name || place.address_name,
      category: place.category_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      // 추가 정보
      placeUrl: place.place_url,
      phone: place.phone,
    }));

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("위치 검색 오류:", error);
    return NextResponse.json(
      { error: "위치 검색 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
