import StarIcon from "../assets/images/svg/StarOutline.svg";
export const starTemplate = (rating: number, color?: string) => {
  const ratingList = [];
  for (var i = 1; i <= 5; i++) {
    ratingList.push(i);
  }

  return ratingList?.map((star) => (
    <StarIcon
      height={20}
      width={20}
      fill={rating >= star ? color || "rgba(92, 111, 127, 1)" : "white"}
      key={star}
      // color={rating >= star ? color || "rgba(92, 111, 127, 1)" : "white"}
    />
  ));
};
