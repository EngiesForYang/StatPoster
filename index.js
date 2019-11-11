function getStats(e) {
  e.preventDefault();
  try {
    console.log({ e });
  } catch (e) {
    console.error(e);
  }
  return false;
}

document.getElementById("app").innerHTML = `
<h1>Hello Yang!</h1>
<div>
  <form onsubmit='return getStats(event);'>
      <input type='text'/>
      <input type='submit' />
  </form>
</div>
`;
