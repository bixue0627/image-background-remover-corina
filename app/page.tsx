export default function Home() {
  const [file, setFile] = useState(null);
  return (
    <div style={{padding: "40px", textAlign: "center"}}>
      <h1>Image Background Remover</h1>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
      <p>{file ? file.name : "No file selected"}</p>
    </div>
  );
}
