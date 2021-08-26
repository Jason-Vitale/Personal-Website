const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

ctx.font = "30px Arial";
ctx.shadowColor = "rgba(255,255,255,.6)";

// Constants in objects doesnt work cause objects passing as reference and will by modified!
// If you want constant constant, use primitives
const SPACESHIP_SIZE = {
    width: 15,
    height: 25
};
const SPACESHIP_POSITION = {
    x: canvas.width / 2,
    y: canvas.height / 2
};
const GRAVITY = 0;
const HOVER_TICKS = 20;
//Update thrust constant
const THRUST = 5;

const Systems = {
    "main": {
        holes: [{
                x: canvas.width / 8,
                y: canvas.height / 3,
                size: 40,
                dest: "Education"
            },
            {
                x: canvas.width / 8,
                y: canvas.height / 1.15,
                size: 40,
                dest: "Technical Skills"
            },
            {
                x: canvas.width / 2,
                y: canvas.height / 3,
                size: 40,
                dest: "Experience"
            },
            {
                x: canvas.width / 2,
                y: canvas.height / 1.15,
                size: 40,
                dest: "Additional Experience"
            },
            {
                x: canvas.width / 1.1,
                y:canvas.height / 3,
                size: 40,
                dest: "Projects"
            },
            {
                x: canvas.width / 1.1,
                y: canvas.height / 1.15,
                size: 40,
                dest: "Contact Me"
            }
        ]
    },
    "Education": {
        holes: [{
            x: canvas.width - 200,
            y: canvas.height - 100,
            size: 40,
            dest: "main"
        }]
    },

    "Technical Skills": {
        holes: [{
            x: canvas.width - 200,
            y: canvas.height - 100,
            size: 40,
            dest: "main"
        }]
    },

    "Experience": {
        holes: [{
            x: canvas.width - 200,
            y: canvas.height - 100,
            size: 40,
            dest: "main"
        }]
    },

    "Additional Experience": {
        holes: [{
            x: canvas.width - 100,
            y: canvas.height - 200,
            size: 40,
            dest: "main"
        }]
    },

    "Personal Projects": {
        holes: [{
            x: canvas.width - 200,
            y: canvas.height - 100,
            size: 40,
            dest: "main"
        }]
    },
    "Projects": {
        holes: [{
            x: canvas.width - 200,
            y: canvas.height -100,
            size: 40,
            dest: "main"
        }]

    },
    "Contact Me": {
        holes: [{
            x: canvas.width - 250,
            y: canvas.height - 100,
            size: 40,
            dest: "main"
        }]
    }
};

let spaceShip;
let currentSystem = "main";
const spaceObjects = [];

class SpaceObject {
    constructor(size, position, color = "black", angle = 0) {
        this.color = color;
        this.size = size;
        this.position = position;
        this.angle = angle;
        spaceObjects.push(this);
    }
    tick() {
        this.update();
        this.draw();
    }
    update() {}
    draw() {}
    isAbove({
        x,
        y
    }) {
        return (
            Math.abs(this.position.x - x) < this.size &&
            Math.abs(this.position.y - y) < this.size
        );
    }
    destroy() {
        spaceObjects.splice(spaceObjects.indexOf(this), 1);
    }
}

class SpaceShip extends SpaceObject {
    constructor(size, position) {
        super(size, position, "yellow");
        this.aboveHole = 0;
        this.engineOn = false;
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.velocity = {
            x: 0,
            y: 0
        };
    }

    draw() {
        const triangleCenterX = this.position.x + 0.5 * this.size.width;
        const triangleCenterY = this.position.y + 0.5 * this.size.height;
        ctx.shadowBlur = 0;
        ctx.save();
        ctx.translate(triangleCenterX, triangleCenterY);
        ctx.rotate(this.angle);
        ctx.lineWidth = 5;
        ctx.beginPath();
        // Triangle
        ctx.moveTo(0, -this.size.height / 2);
        ctx.lineTo(-this.size.width / 2, this.size.height / 2);
        ctx.lineTo(this.size.width / 2, this.size.height / 2);
        ctx.closePath();

        ctx.strokeStyle = this.color;
        ctx.stroke();

        ctx.fillStyle = "red";
        ctx.fill();

        // Flame for engine
        if (this.engineOn) {
            const fireYPos = this.size.height / 2 + 4;
            const fireXPos = this.size.width * 0.25;
            ctx.beginPath();
            ctx.moveTo(-fireXPos, fireYPos);
            ctx.lineTo(fireXPos, fireYPos);
            ctx.lineTo(0, fireYPos + Math.random() * 100);
            ctx.lineTo(-fireXPos, fireYPos);
            ctx.closePath();
            ctx.fillStyle = "orange";
            ctx.fill();
        }
        ctx.restore();
    }

    update() {
        this.moveSpaceShip();
        this.checkAboveHole();
    }

    moveSpaceShip() {
        // Angle has to be in radians
        const degToRad = Math.PI / 180;
        // Change the position based on velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        // Move spaceship to other side when leaving screen
        this.position.x = (canvas.width + this.position.x) % canvas.width;
        this.position.y = (canvas.height + this.position.y) % canvas.height;
        /*
             Adding floating point numbers to the end of the
             rotaion handling to make roation faster
             */
        if (this.rotatingLeft) this.angle -= degToRad + 0.15;
        if (this.rotatingRight) this.angle += degToRad + 0.15;

        // Acceleration
        if (this.engineOn) {
            this.velocity.x += (THRUST / 100) * Math.sin(this.angle);
            this.velocity.y -= (THRUST / 100) * Math.cos(this.angle);
        }
        // Update the velocity depending on gravity
        this.velocity.y += GRAVITY / 2500;
    }

    checkAboveHole() {
        const hole = spaceObjects.find(
            (spaceObject) =>
            spaceObject !== this && spaceObject.isAbove(this.position)
        );
        if (hole) {
            this.aboveHole++;
            if (this.aboveHole > HOVER_TICKS) {
                confirm(`Jump through system ${hole.dest}?`) && jump(hole);
                this.aboveHole = 0;
            }
        } else {
            this.aboveHole = 0;
        }
    }
}

const circle = (ctx, x, y, radius, color = "white") => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
};

class BlackHole extends SpaceObject {
    constructor(size, position, dest) {
        super(size, position);
        this.dest = dest;
    }
    update() {
        // Spin?
        this.angle += 0.01;
    }
    draw() {
        // Shadow
        ctx.shadowBlur = this.size >>> 2;
        //ctx.shadowBlur = null;
        
        
        circle(
            ctx,
            this.position.x,
            this.position.y,
            this.size + 1,
            `rgba(255, 255, 255, .6)`
        );
        
        // Hole
        circle(ctx, this.position.x, this.position.y, this.size, this.color);

        
        // Spinning view

        
        circle(
            ctx,
            this.position.x + (this.size * Math.sin(this.angle) - 1),
            this.position.y + (this.size * Math.cos(this.angle) - 1),
            2,
            "gray"
        );
        
        circle(
            ctx,
            this.position.x - (this.size * Math.sin(this.angle) - 1),
            this.position.y - (this.size * Math.cos(this.angle) - 1),
            2,
            "gray"
        );
        
    }
}

function handleKeyInput(event) {
    const {
        keyCode,
        type
    } = event;
    const isKeyDown = type === "keydown" ? true : false;

    if (keyCode === 37) spaceShip.rotatingLeft = isKeyDown;
    if (keyCode === 39) spaceShip.rotatingRight = isKeyDown;
    if (keyCode === 38) spaceShip.engineOn = isKeyDown;
}

function jump({
    dest
}) {
    currentSystem = dest || "main";
    while (spaceObjects.length) spaceObjects[0].destroy();
    Systems[currentSystem].holes.forEach(
        (hole) => new BlackHole(hole.size, {
            x: hole.x,
            y: hole.y
        }, hole.dest)
    );
    spaceShip = new SpaceShip(SPACESHIP_SIZE, SPACESHIP_POSITION);
}

function main() {
    ctx.font = "20px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(
        "Education Portal",
        Systems["main"].holes[0].x,
        Systems["main"].holes[0].y - 50
    );
    ctx.fillText(
        "Technical Skills Portal",
        Systems["main"].holes[1].x,
        Systems["main"].holes[1].y - 50
    );
    ctx.fillText(
        "Experience Portal",
        Systems["main"].holes[2].x,
        Systems["main"].holes[2].y - 50
    );
    ctx.fillText(
        "Additional Experience Portal",
        Systems["main"].holes[3].x,
        Systems["main"].holes[3].y - 50
    );
    ctx.fillText(
        "Projects Portal",
        Systems["main"].holes[4].x,
        Systems["main"].holes[4].y - 50
    )
    ctx.fillText(
        "Contact Me Portal",
        Systems["main"].holes[5].x,
        Systems["main"].holes[5].y - 50
    );
}

function edu() {
    //College
    ctx.font = "italic 20px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(
        "Binghamton University, State University of New York, ",
        canvas.width / 2,
        150
    );
    ctx.fillText(
        "Thomas J. Watson College of Engineering and Applied Science",
        canvas.width / 2,
        170
    );
    ctx.fillText(
        "Bachelor of Science in Computer Science",
        canvas.width / 2,
        190
    );
    ctx.font = "20px Courier New";
    ctx.fillText("Overall GPA: 3.92", canvas.width / 2, 210);
    ctx.fillText("Major GPA: 4.0", canvas.width / 2, 230);
    ctx.fillText(
        "Relevant Coursework: Programming and Hardware Fundamentals,",
        canvas.width / 2,
        270
    );
    ctx.fillText(
        "Professional Skills, Ethics, and CS Trends,",
        canvas.width / 2,
        290
    );
    ctx.fillText(
        "Data Structures and Algorithms, Programming with Objects and Data Structures,",
        canvas.width / 2,
        310
    );
    ctx.fillText(
        "Architecture from a Programmer Perspective (By Fall 2021)",
        canvas.width / 2,
        330
    );
    //High School
    ctx.font = "italic 20px Courier New";
    ctx.fillText("Islip High School", canvas.width / 2, 430);
    ctx.fillText(
        "STEM Academy Honors",
        canvas.width / 2,
        450
    );
    ctx.font = "20px Courier New";
    ctx.fillText(
        "Overall GPA: 100.77, Top 5% of class",
        canvas.width / 2,
        470
    );

    ctx.fillText(
        "Return",
        Systems["Education"].holes[0].x,
        Systems["Education"].holes[0].y - 50
    );
}

function techSkills() {
    ctx.font = "20px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(
        "Languages: Python, Java, HTML, CSS, JavaScript, C++",
        canvas.width / 2,
        150
    );
    ctx.fillText(
        "Software and OS: VS Code, Eclipse, Sublime Text, Git, Logisim, Anaconda,",
        canvas.width / 2,
        190
    );
    ctx.fillText(
        "Spyder, Microsoft Office, Linux, MacOS",
        canvas.width / 2,
        210
    );
    ctx.fillText(
        "Additional: Familiar with MySQL, Arduino",
        canvas.width / 2,
        250
    );

    ctx.fillText(
        "Return",
        Systems["Technical Skills"].holes[0].x,
        Systems["Technical Skills"].holes[0].y - 50
    );
}

function exp1() {
    ctx.font = "20px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(
        "Binghamton University Rover Team, Software Engineer | Binghamton, NY",
        canvas.width / 2,
        150
    );
    ctx.fillText("October 2020 - August 2021", canvas.width / 2, 170);
    ctx.fillText(
        ">Designed networks and code bases using C++ to maximize the efficiency",
        canvas.width / 2,
        210
    );
    ctx.fillText(
        "and performance of a model mars rover for The Mars Society University",
        canvas.width / 2,
        230
    );
    ctx.fillText("Rover Challenge which takes place yearly", canvas.width / 2, 250);

    ctx.fillText(
        ">Built a custom username/password page by interfacing Google Firebase",
        canvas.width / 2, 270
    );
    ctx.fillText(
        "with a HTML, CSS, and JavaScript page which allowed for user",
        canvas.width / 2,
        290
    );
    ctx.fillText(
        "authentication, permitting members of the team to view classified documents",
        canvas.width / 2,
        310
    );
    ctx.fillText(
        ">Prepared rover data by implementing Python script from scratch",
        canvas.width / 2,
        330
    );
    ctx.fillText(
        "using Matplotlib and NumPy which led to data visualization to be analyzed",
        canvas.width / 2,
        350
    );
    ctx.fillText(
        ">Constructed the GUI for the base station computer in C++ so",
        canvas.width / 2,
        370
    );
    ctx.fillText(
        "that all the components of the rover could be viewed in the most effective way",
        canvas.width / 2,
        390
    );
    ctx.fillText(
        "JPMorgan Chase, Software Engineering Virtual Experience Program | Remote Role",
        canvas.width / 2,
        480
    );
    ctx.fillText("July 2020 - September 2020", canvas.width / 2, 500);
    ctx.fillText(
        ">Modified an interface with a stock price data feed using Python 3 so that the system/data could be analyzed",
        canvas.width / 2,
        540
    );
    ctx.fillText(
        ">Implemented the perspective open-source code in preparation for data visualization",
        canvas.width / 2,
        560
    );
    ctx.fillText(
        ">Received certificate of completion by end of program",
        canvas.width / 2,
        580
    );
    ctx.fillText(
        "Return",
        Systems["Experience"].holes[0].x,
        Systems["Experience"].holes[0].y - 50
    );
}

function exp2() {
    ctx.font = "20px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(
        "Google CSSI, Coursera, Software Engineering Student | Remote Role",
        canvas.width / 2,
        150
    );
    ctx.fillText("June 2020 - August 2020", canvas.width/2, 170);
    ctx.fillText(
        ">Selected to take part in an invite-only Google Tech Student Development program",
        canvas.width / 2,
        190
    );
    ctx.fillText(
        ">Developed/designed personal web pages through CodePen using HTML, CSS, and JavaScript",
        canvas.width / 2,
        210
    );
    ctx.fillText(
        ">Reviewed, designed, and implemented a green screen algorithm in JavaScript",
        canvas.width / 2,
        230
    );
    ctx.fillText(
        "to transform images on our developed web pages",
        canvas.width / 2,
        250
    );
    ctx.fillText(
        ">Learned to hide data in images through the use of steganography",
        canvas.width / 2,
        270
    );
    ctx.fillText(
        ">Received certificate of completion by end of program",
        canvas.width / 2,
        290
    );



    ctx.fillText("Founder, Islip Charity Spikeball Tournament | Islip, NY", canvas.width / 2, 380);
    ctx.fillText("June 2019 - July 2020", canvas.width/2, 400);
    ctx.fillText(">Raised $5,000 by creating and running a Spikeball Charity Tournament as accomplished through", canvas.width/2, 440);
    ctx.fillText("organizing selected teams to compete in a day long tournament", canvas.width / 2, 460);
    ctx.fillText(">All proceeds from the 2-year event were donated to the American Cancer Society", canvas.width / 2, 480);

    ctx.fillText("National Grid, Engineering Intern | Melville, NY", canvas.width/2, 570);
    ctx.fillText("June 2019 - August 2019", canvas.width/2, 590);
    ctx.fillText(">1 of the 10 students chosen nationwide to participate as an engineering intern", canvas.width/2, 630);
    ctx.fillText(">Appointed team leader of the 10 interns by demonstrating strong communication skills,", canvas.width/2, 650);
    ctx.fillText(" problem solving skills, hard work, and persistence as showcased through various team building exercises", canvas.width/2, 670);
    ctx.fillText(">Developed solutions by collaborating with a team of experienced", canvas.width/2, 690);
    ctx.fillText("engineers through various group discussions and analyzing data", canvas.width/2, 710);





    ctx.fillText(
        "Return",
        Systems["Additional Experience"].holes[0].x,
        Systems["Additional Experience"].holes[0].y - 50
    );
}

function proj(){
    ctx.font = "20px Courier New";
    ctx.textAlign = "center";

    ctx.fillText(
        "Interactive Personal Website | Islip, NY",
        canvas.width / 2, 150
        );
    ctx.fillText("June 2021 - August 2021", canvas.width / 2, 170);
    ctx.fillText(">Created interactive personal website from scratch which allows", canvas.width / 2, 210);
    ctx.fillText("the user to guide a rocket ship into different portals which lead to different parts of my resume", canvas.width / 2, 230);
    ctx.fillText(">Engineered using HTML and JavaScript to display contents onto the screen", canvas.width / 2, 250);

    ctx.fillText(
        "Facial Recognotoion Software | Binghamton, NY",
        canvas.width / 2, 340
    );
    ctx.fillText("March 2021 - April 2021", canvas.width/2, 360);
    ctx.fillText(">Created facial recognition software by implementing OpenCV and Face Recognition", canvas.width/2, 400);
    ctx.fillText("libraries used to identify familiar faces", canvas.width / 2, 420);
    ctx.fillText(">Software utilizes a convolutional neural network to recognize faces and names of", canvas.width / 2, 440);
    ctx.fillText("people from the hit T.V. show The Office when a video file is passed into the program ", canvas.width/2, 460);


    ctx.fillText(
        "Return",
        Systems["Projects"].holes[0].x,
        Systems["Projects"].holes[0].y - 50
    );
}
function contact(){
    ctx.fillText(
        "Contact Information",
        canvas.width / 2,
        150);

    ctx.fillText("Phone Number: (631)-741-9741", canvas.width/2, 190);
    ctx.fillText("Email Address: vitale.jason.jr@gmail.com", canvas.width/2, 230);
    ctx.fillText("Github: https://github.com/Jason-Vitale", canvas.width/2, 270);
    ctx.fillText("LinkedIn: http://www.linkedin.com/in/jason-vitale-jr", canvas.width/2, 310);

    ctx.fillText(
        "Return",
        Systems["Contact Me"].holes[0].x,
        Systems["Contact Me"].holes[0].y - 50
    );

}

function draw() {
    // Clear screen
    ctx.fillStyle = "rgb(0, 10, 60)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "20px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(
        'Welcome to jasonvitale.com',
        canvas.width/2,
        canvas.height - canvas.height/1.02
    );
    ctx.fillText(
        `You are in ${currentSystem}`,
        canvas.width / 2,
        canvas.height - canvas.height / 1.05
    );
    ctx.fillText(
        `Use the arrow keys to guide the rocket into different portals`,
        canvas.width / 2,
        canvas.height - canvas.height / 1.08
    );
    ctx.fillText(
        `Refresh the page if you resize your window`,
        canvas.width / 2,
        canvas.height - canvas.height / 1.11
    );

    //Adding section/system text information
    /*
      if(currentSystem=='main'){
          ctx.font ='bolder 20px Courier New'
          ctx.fillText('Education Portal', canvas.width/9, canvas.height/4);
          ctx.fillText('Technical Skills Portal', canvas.width/9.2, canvas.height/1.27);
          ctx.fillText('Experience Portal', canvas.width/2, canvas.height/4);
          ctx.fillText('Experience Portal', canvas.width/2, canvas.height/1.27);
          ctx.fillText('Contact Me', canvas.width/1.25, canvas.height/4);

      }
      */
  
   //Loading small stars
    ctx.shadowBlur = 1;
    for (
        var i = 1, j = 1; j < canvas.height; i += 100, i > canvas.width && ((i = 1), (j += 100)), circle(ctx, i, j, 1)
    );

    //loading medium stars
    ctx.shadowBlur = 2;
    for (
        var i = 1, j = 1; j < canvas.height; i += 150, i > canvas.width && ((i = 1), (j += 150)), circle(ctx, i, j, 2)
    );

    //loading larger stars
    ctx.shadowBlur = 3;
    for (
        var i = 1, j = 1; j < canvas.height; i += 225, i > canvas.width && ((i = 1), (j += 225)), circle(ctx, i, j, 3)
    );

    if (currentSystem == "main") {
        main();
    }
    if (currentSystem == "Education") {
        edu();
    }
    if (currentSystem == "Technical Skills") {
        techSkills();
    }
    if (currentSystem == "Experience") {
        exp1();
    }
    if (currentSystem == "Additional Experience") {
        exp2();
    }
    if (currentSystem == "Projects") {
        proj();
    }
    if (currentSystem == "Contact Me") {
        contact();
    }

    // tick all objects
    spaceObjects.forEach((spaceObject) => spaceObject.tick());

    // Repeats
    requestAnimationFrame(draw);
}

// Event Listeners
window.addEventListener("resize", (e) => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});
document.addEventListener("keydown", handleKeyInput);
document.addEventListener("keyup", handleKeyInput);
// Start the game
jump({
    dest: "main"
});
draw();