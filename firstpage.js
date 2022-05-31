  const audio = new Audio();
  audio.src = "sounds/click.mp3";
  
  document
    .getElementById("sasuke")
    .addEventListener("mouseover", function (event) {
      event.target.style.height = "95%";
      event.target.style.width = "95%";
    });

  document
    .getElementById("sasuke")
    .addEventListener("mouseout", function (event) {
      event.target.style.height = "90%";
      event.target.style.width = "90%";
    });
  document
    .getElementById("hashi")
    .addEventListener("mouseover", function (event) {
      event.target.style.height = "95%";
      event.target.style.width = "95%";
    });
  
  document
    .getElementById("hashi")
    .addEventListener("mouseout", function (event) {
      event.target.style.height = "90%";
      event.target.style.width = "90%";
    });

  document
    .getElementById("pros")
    .addEventListener("mouseover", function (event) {
      event.target.style.height = "95%";
      event.target.style.width = "95%";
    });
  
  document
    .getElementById("pros")
    .addEventListener("mouseout", function (event) {
      event.target.style.height = "90%";
      event.target.style.width = "90%";
    });


  