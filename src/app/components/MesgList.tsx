export const MesgList = (props: { mylist: { id: string; mesg: string }[] }) => {
  const mylist = props.mylist;

  return (
    <pre>
      <ul style={{ listStyle: "none" }}>
        {mylist.map((item) => (
          <li key={item.id}>{item.mesg}</li>
        ))}
      </ul>
    </pre>
  );
};
