export default function Preview({ item }) {
  if (item.sourceType === "image") {
    return (
      <img
        src={item.sourceUrl}
        alt=""
        style={{ width: 120, height: 80, objectFit: "cover" }}
      />
    );
  }

  if (item.sourceType === "pdf") {
    return (
      <iframe
        src={item.sourceUrl}
        title="PDF Preview"
        width="120"
        height="80"
        style={{ border: "1px solid #333" }}
      />
    );
  }

  return null;
}
