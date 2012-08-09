//
//  main.js
//
//  A project template for using arbor.js
//

(function($){

  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem

    var that = {
      init:function(system){
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side
        
        // set up some event handlers to allow for node-dragging
        that.initMouseHandling()
      },
      
      redraw:function(){
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        // 
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, canvas.width, canvas.height)
        
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
          ctx.strokeStyle = "rgba(0,0,0, .333)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        })

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // draw a rectangle centered at pt
          var w = 10
          ctx.fillStyle = (node.data.alone) ? "orange" : "black"
          ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w)
		  ctx.font = 'italic 13px sans-serif';
		  ctx.fillText(node.name, pt.x+8, pt.y+8);
        })    			
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        
        // start listening
        $(canvas).mousedown(handler.clicked);

      },
      
    }
    return that
  }    

  $(document).ready(function(){
    //var sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
	var sys = arbor.ParticleSystem(1000, 0, 0.5)
    sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...
	
	// get data variable through an ajax call to URL <article_name>/<depth>
	
	var article_name = "Computer";
	var depth = 1;
	$.getJSON(article_name + "/" + depth.toString(), function(json) 
		{
			var data = json;
		}
	);
	
	/*
	var data = 
	{
		nodes:
		{
			'Computer':{'shape':'dot','label':'Computer','link':'http://en.wikipedia.org/wiki/Computer'},
			'Optical disc':{'shape':'dot','label':'Optical disc','link':'http://en.wikipedia.org/wiki/Optical disc'},
			'Personal digital assistant':{'shape':'dot','label':'Personal digital assistant','link':'http://en.wikipedia.org/wiki/Personal digital assistant'},
			'Fortran':{'shape':'dot','label':'Fortran','link':'http://en.wikipedia.org/wiki/Fortran'},
			'Address programming language':{'shape':'dot','label':'Address programming language','link':'http://en.wikipedia.org/wiki/Address programming language'}
		},
		edges:
		{
			'Computer':{ 'Optical disc':{}, 'Personal digital assistant':{}, 'Fortran':{} },
			'Fortran':{ 'Address programming language':{} }
		}
	};*/
	
	/*
	var data = 
	{
		nodes:
		{
    "Optical disc": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Optical disc",
      "label": "Optical disc"
    },
    "Personal digital assistant": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Personal digital assistant",
      "label": "Personal digital assistant"
    },
    "Fortran": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Fortran",
      "label": "Fortran"
    },
    "Quantum computing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Quantum computing",
      "label": "Quantum computing"
    },
    "Claude Shannon": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Claude Shannon",
      "label": "Claude Shannon"
    },
    "Turing-complete": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Turing-complete",
      "label": "Turing-complete"
    },
    "Analog computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Analog computer",
      "label": "Analog computer"
    },
    "Institution of Engineering and Technology": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Institution of Engineering and Technology",
      "label": "Institution of Engineering and Technology"
    },
    "Keypunch": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Keypunch",
      "label": "Keypunch"
    },
    "Embarrassingly parallel": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Embarrassingly parallel",
      "label": "Embarrassingly parallel"
    },
    "DEC Alpha": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/DEC Alpha",
      "label": "DEC Alpha"
    },
    "Herman Hollerith": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Herman Hollerith",
      "label": "Herman Hollerith"
    },
    "Text-based (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Text-based (computing)",
      "label": "Text-based (computing)"
    },
    "Digital audio": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Digital audio",
      "label": "Digital audio"
    },
    "GNOME": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/GNOME",
      "label": "GNOME"
    },
    "Exploit (computer security)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Exploit (computer security)",
      "label": "Exploit (computer security)"
    },
    "Konrad Zuse": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Konrad Zuse",
      "label": "Konrad Zuse"
    },
    "VAX": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/VAX",
      "label": "VAX"
    },
    "Time 100: The Most Important People of the Century": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Time 100: The Most Important People of the Century",
      "label": "Time 100: The Most Important People of the Century"
    },
    "Electrical network": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electrical network",
      "label": "Electrical network"
    },
    "Electrical engineering": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electrical engineering",
      "label": "Electrical engineering"
    },
    "Conditional (programming)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Conditional (programming)",
      "label": "Conditional (programming)"
    },
    "Tabulating machine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Tabulating machine",
      "label": "Tabulating machine"
    },
    "Mozilla Foundation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mozilla Foundation",
      "label": "Mozilla Foundation"
    },
    "Time (magazine)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Time (magazine)",
      "label": "Time (magazine)"
    },
    "COBOL": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/COBOL",
      "label": "COBOL"
    },
    "MIT Press": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/MIT Press",
      "label": "MIT Press"
    },
    "Museum of Science and Industry (Manchester)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Museum of Science and Industry (Manchester)",
      "label": "Museum of Science and Industry (Manchester)"
    },
    "Motorola 68000": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Motorola 68000",
      "label": "Motorola 68000"
    },
    "Life magazine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Life magazine",
      "label": "Life magazine"
    },
    "Computer-aided manufacturing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer-aided manufacturing",
      "label": "Computer-aided manufacturing"
    },
    "Intel 4040": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 4040",
      "label": "Intel 4040"
    },
    "Free software": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Free software",
      "label": "Free software"
    },
    "Spreadsheet": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Spreadsheet",
      "label": "Spreadsheet"
    },
    "HP-UX": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/HP-UX",
      "label": "HP-UX"
    },
    "Asymmetric digital subscriber line": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Asymmetric digital subscriber line",
      "label": "Asymmetric digital subscriber line"
    },
    "Computer hardware": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer hardware",
      "label": "Computer hardware"
    },
    "Victoria University of Manchester": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Victoria University of Manchester",
      "label": "Victoria University of Manchester"
    },
    "Algorithm": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Algorithm",
      "label": "Algorithm"
    },
    "ARPANET": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/ARPANET",
      "label": "ARPANET"
    },
    "Personal computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Personal computer",
      "label": "Personal computer"
    },
    "Slide rule": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Slide rule",
      "label": "Slide rule"
    },
    "3D computer graphics": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/3D computer graphics",
      "label": "3D computer graphics"
    },
    "Logical disjunction": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Logical disjunction",
      "label": "Logical disjunction"
    },
    "Intel 8008": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 8008",
      "label": "Intel 8008"
    },
    "Installation (computer programs)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Installation (computer programs)",
      "label": "Installation (computer programs)"
    },
    "Information systems (discipline)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Information systems (discipline)",
      "label": "Information systems (discipline)"
    },
    "Digital audio editor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Digital audio editor",
      "label": "Digital audio editor"
    },
    "Aqua (user interface)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Aqua (user interface)",
      "label": "Aqua (user interface)"
    },
    "1890 United States Census": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/1890 United States Census",
      "label": "1890 United States Census"
    },
    "Low-level programming language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Low-level programming language",
      "label": "Low-level programming language"
    },
    "Library (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Library (computing)",
      "label": "Library (computing)"
    },
    "International Federation for Information Processing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/International Federation for Information Processing",
      "label": "International Federation for Information Processing"
    },
    "Computer music": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer music",
      "label": "Computer music"
    },
    "Hans Meuer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Hans Meuer",
      "label": "Hans Meuer"
    },
    "DirectX": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/DirectX",
      "label": "DirectX"
    },
    "Punched tape": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Punched tape",
      "label": "Punched tape"
    },
    "Hypertext Transfer Protocol": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Hypertext Transfer Protocol",
      "label": "Hypertext Transfer Protocol"
    },
    "IBM System/360": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM System/360",
      "label": "IBM System/360"
    },
    "Mobile computing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mobile computing",
      "label": "Mobile computing"
    },
    "Interactive fiction": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Interactive fiction",
      "label": "Interactive fiction"
    },
    "Motorola 6800": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Motorola 6800",
      "label": "Motorola 6800"
    },
    "Optical computing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Optical computing",
      "label": "Optical computing"
    },
    "Real-time operating system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Real-time operating system",
      "label": "Real-time operating system"
    },
    "Intel 80486": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 80486",
      "label": "Intel 80486"
    },
    "Motorola 6809": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Motorola 6809",
      "label": "Motorola 6809"
    },
    "C (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/C (programming language)",
      "label": "C (programming language)"
    },
    "Malware scanner": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Malware scanner",
      "label": "Malware scanner"
    },
    "C standard library": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/C standard library",
      "label": "C standard library"
    },
    "Microsoft Windows": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Microsoft Windows",
      "label": "Microsoft Windows"
    },
    "Multimedia": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Multimedia",
      "label": "Multimedia"
    },
    "Unconventional computing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Unconventional computing",
      "label": "Unconventional computing"
    },
    "Computer multitasking": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer multitasking",
      "label": "Computer multitasking"
    },
    "Simple Mail Transfer Protocol": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Simple Mail Transfer Protocol",
      "label": "Simple Mail Transfer Protocol"
    },
    "Turing completeness": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Turing completeness",
      "label": "Turing completeness"
    },
    "Program counter": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Program counter",
      "label": "Program counter"
    },
    "DOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/DOS",
      "label": "DOS"
    },
    "Ra\u00fal Rojas": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ra\u00fal Rojas",
      "label": "Ra\u00fal Rojas"
    },
    "Arithmetic logic unit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Arithmetic logic unit",
      "label": "Arithmetic logic unit"
    },
    "Memory (computers)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Memory (computers)",
      "label": "Memory (computers)"
    },
    "Punched card": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Punched card",
      "label": "Punched card"
    },
    "Machine code": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Machine code",
      "label": "Machine code"
    },
    "Computer networking": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer networking",
      "label": "Computer networking"
    },
    "Cluster (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Cluster (computing)",
      "label": "Cluster (computing)"
    },
    "Cryptanalysis": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Cryptanalysis",
      "label": "Cryptanalysis"
    },
    "Optical disc drive": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Optical disc drive",
      "label": "Optical disc drive"
    },
    "SPARC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/SPARC",
      "label": "SPARC"
    },
    "Vector processor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Vector processor",
      "label": "Vector processor"
    },
    "Harvard architecture": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Harvard architecture",
      "label": "Harvard architecture"
    },
    "Advanced Micro Devices": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Advanced Micro Devices",
      "label": "Advanced Micro Devices"
    },
    "Accounting software": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Accounting software",
      "label": "Accounting software"
    },
    "Logic gates": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Logic gates",
      "label": "Logic gates"
    },
    "Electronic calculator": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electronic calculator",
      "label": "Electronic calculator"
    },
    "Digital audio player": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Digital audio player",
      "label": "Digital audio player"
    },
    "IBM 702": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM 702",
      "label": "IBM 702"
    },
    "IBM 701": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM 701",
      "label": "IBM 701"
    },
    "Ancient Greece": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ancient Greece",
      "label": "Ancient Greece"
    },
    "Kermit (protocol)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Kermit (protocol)",
      "label": "Kermit (protocol)"
    },
    "Portable computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Portable computer",
      "label": "Portable computer"
    },
    "Multiprocessing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Multiprocessing",
      "label": "Multiprocessing"
    },
    "Universal Serial Bus": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Universal Serial Bus",
      "label": "Universal Serial Bus"
    },
    "Assembler (computer programming)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Assembler (computer programming)",
      "label": "Assembler (computer programming)"
    },
    "Vector graphics editor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Vector graphics editor",
      "label": "Vector graphics editor"
    },
    "Dorr E. Felt": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Dorr E. Felt",
      "label": "Dorr E. Felt"
    },
    "Calculator": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Calculator",
      "label": "Calculator"
    },
    "Intel 4004": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 4004",
      "label": "Intel 4004"
    },
    "Billiard ball computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Billiard ball computer",
      "label": "Billiard ball computer"
    },
    "IBM": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM",
      "label": "IBM"
    },
    "JavaScript": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/JavaScript",
      "label": "JavaScript"
    },
    "Digital": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Digital",
      "label": "Digital"
    },
    "Read-only memory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Read-only memory",
      "label": "Read-only memory"
    },
    "FLOPS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/FLOPS",
      "label": "FLOPS"
    },
    "Smartphone": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Smartphone",
      "label": "Smartphone"
    },
    "Intel 8048": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 8048",
      "label": "Intel 8048"
    },
    "IRIX": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IRIX",
      "label": "IRIX"
    },
    "Revision control": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Revision control",
      "label": "Revision control"
    },
    "Binary number": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Binary number",
      "label": "Binary number"
    },
    "Computability theory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computability theory",
      "label": "Computability theory"
    },
    "Non-volatile memory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Non-volatile memory",
      "label": "Non-volatile memory"
    },
    "Subroutine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Subroutine",
      "label": "Subroutine"
    },
    "Branch (computer science)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Branch (computer science)",
      "label": "Branch (computer science)"
    },
    "SIMD": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/SIMD",
      "label": "SIMD"
    },
    "TOP500": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/TOP500",
      "label": "TOP500"
    },
    "Computer data storage": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer data storage",
      "label": "Computer data storage"
    },
    "Electronic engineering": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electronic engineering",
      "label": "Electronic engineering"
    },
    "Floating point": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Floating point",
      "label": "Floating point"
    },
    "Harvard Mark II": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Harvard Mark II",
      "label": "Harvard Mark II"
    },
    "Interpreted language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Interpreted language",
      "label": "Interpreted language"
    },
    "Bourne shell": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Bourne shell",
      "label": "Bourne shell"
    },
    "Linux": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Linux",
      "label": "Linux"
    },
    "Educational game": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Educational game",
      "label": "Educational game"
    },
    "Pulse computation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Pulse computation",
      "label": "Pulse computation"
    },
    "Computer Technology Limited": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer Technology Limited",
      "label": "Computer Technology Limited"
    },
    "Firmware": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Firmware",
      "label": "Firmware"
    },
    "Computer (disambiguation)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer (disambiguation)",
      "label": "Computer (disambiguation)"
    },
    "Mainframe computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mainframe computer",
      "label": "Mainframe computer"
    },
    "Two's complement": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Two's complement",
      "label": "Two's complement"
    },
    "Mobile device": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mobile device",
      "label": "Mobile device"
    },
    "Natural language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Natural language",
      "label": "Natural language"
    },
    "Scalar processor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Scalar processor",
      "label": "Scalar processor"
    },
    "Logical conjunction": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Logical conjunction",
      "label": "Logical conjunction"
    },
    "Ruby (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ruby (programming language)",
      "label": "Ruby (programming language)"
    },
    "Oberon (operating system)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Oberon (operating system)",
      "label": "Oberon (operating system)"
    },
    "Server (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Server (computing)",
      "label": "Server (computing)"
    },
    "IBM 650": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM 650",
      "label": "IBM 650"
    },
    "Digital object identifier": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Digital object identifier",
      "label": "Digital object identifier"
    },
    "Computer-aided design": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer-aided design",
      "label": "Computer-aided design"
    },
    "Computer security": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer security",
      "label": "Computer security"
    },
    "Difference engine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Difference engine",
      "label": "Difference engine"
    },
    "16-bit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/16-bit",
      "label": "16-bit"
    },
    "BUNCH": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/BUNCH",
      "label": "BUNCH"
    },
    "Intel 80386": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 80386",
      "label": "Intel 80386"
    },
    "Scripting language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Scripting language",
      "label": "Scripting language"
    },
    "MS-DOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/MS-DOS",
      "label": "MS-DOS"
    },
    "Plan 9 from Bell Labs": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Plan 9 from Bell Labs",
      "label": "Plan 9 from Bell Labs"
    },
    "Square root": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Square root",
      "label": "Square root"
    },
    "Norden bombsight": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Norden bombsight",
      "label": "Norden bombsight"
    },
    "Android (robot)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Android (robot)",
      "label": "Android (robot)"
    },
    "Software bug": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Software bug",
      "label": "Software bug"
    },
    "Mouse (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mouse (computing)",
      "label": "Mouse (computing)"
    },
    "Free Software Foundation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Free Software Foundation",
      "label": "Free Software Foundation"
    },
    "Sabre (computer system)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Sabre (computer system)",
      "label": "Sabre (computer system)"
    },
    "Generational list of programming languages": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Generational list of programming languages",
      "label": "Generational list of programming languages"
    },
    "Debugger": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Debugger",
      "label": "Debugger"
    },
    "Semiconductors": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Semiconductors",
      "label": "Semiconductors"
    },
    "International Organization for Standardization": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/International Organization for Standardization",
      "label": "International Organization for Standardization"
    },
    "Instruction set": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Instruction set",
      "label": "Instruction set"
    },
    "Antikythera mechanism": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Antikythera mechanism",
      "label": "Antikythera mechanism"
    },
    "First-person shooter": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/First-person shooter",
      "label": "First-person shooter"
    },
    "Computer program": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer program",
      "label": "Computer program"
    },
    "Association for Computing Machinery": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Association for Computing Machinery",
      "label": "Association for Computing Machinery"
    },
    "Application software": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Application software",
      "label": "Application software"
    },
    "Perl": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Perl",
      "label": "Perl"
    },
    "Manchester Small-Scale Experimental Machine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Manchester Small-Scale Experimental Machine",
      "label": "Manchester Small-Scale Experimental Machine"
    },
    "Truth value": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Truth value",
      "label": "Truth value"
    },
    "Routing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Routing",
      "label": "Routing"
    },
    "Comment (computer programming)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Comment (computer programming)",
      "label": "Comment (computer programming)"
    },
    "Stack machine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Stack machine",
      "label": "Stack machine"
    },
    "PDP-8": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/PDP-8",
      "label": "PDP-8"
    },
    "Church\u2013Turing thesis": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Church\u2013Turing thesis",
      "label": "Church\u2013Turing thesis"
    },
    "Renaissance": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Renaissance",
      "label": "Renaissance"
    },
    "Computer simulation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer simulation",
      "label": "Computer simulation"
    },
    "FreeDOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/FreeDOS",
      "label": "FreeDOS"
    },
    "Data (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Data (computing)",
      "label": "Data (computing)"
    },
    "Strategy game": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Strategy game",
      "label": "Strategy game"
    },
    "Random-access memory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Random-access memory",
      "label": "Random-access memory"
    },
    "86-DOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/86-DOS",
      "label": "86-DOS"
    },
    "MOS Technology 6502": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/MOS Technology 6502",
      "label": "MOS Technology 6502"
    },
    "Mechanical calculator": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mechanical calculator",
      "label": "Mechanical calculator"
    },
    "E-mail client": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/E-mail client",
      "label": "E-mail client"
    },
    "Asynchronous Transfer Mode": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Asynchronous Transfer Mode",
      "label": "Asynchronous Transfer Mode"
    },
    "Computer animation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer animation",
      "label": "Computer animation"
    },
    "Hero of Alexandria": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Hero of Alexandria",
      "label": "Hero of Alexandria"
    },
    "Association for Information Systems": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Association for Information Systems",
      "label": "Association for Information Systems"
    },
    "Vacuum tube": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Vacuum tube",
      "label": "Vacuum tube"
    },
    "Computation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computation",
      "label": "Computation"
    },
    "Pentium FDIV bug": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Pentium FDIV bug",
      "label": "Pentium FDIV bug"
    },
    "DNA computing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/DNA computing",
      "label": "DNA computing"
    },
    "Computer insecurity": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer insecurity",
      "label": "Computer insecurity"
    },
    "Microphone": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Microphone",
      "label": "Microphone"
    },
    "Laptop": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Laptop",
      "label": "Laptop"
    },
    "IBM System/36": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM System/36",
      "label": "IBM System/36"
    },
    "IBM System/32": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM System/32",
      "label": "IBM System/32"
    },
    "User interface": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/User interface",
      "label": "User interface"
    },
    "Internet Society": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Internet Society",
      "label": "Internet Society"
    },
    "Microprocessor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Microprocessor",
      "label": "Microprocessor"
    },
    "Ternary computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ternary computer",
      "label": "Ternary computer"
    },
    "George Stibitz": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/George Stibitz",
      "label": "George Stibitz"
    },
    "Serious game": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Serious game",
      "label": "Serious game"
    },
    "ENIAC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/ENIAC",
      "label": "ENIAC"
    },
    "Comparison of Linux distributions": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Comparison of Linux distributions",
      "label": "Comparison of Linux distributions"
    },
    "Command-line interface": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Command-line interface",
      "label": "Command-line interface"
    },
    "Fiber distributed data interface": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Fiber distributed data interface",
      "label": "Fiber distributed data interface"
    },
    "IBM PC DOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM PC DOS",
      "label": "IBM PC DOS"
    },
    "Protocol (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Protocol (computing)",
      "label": "Protocol (computing)"
    },
    "Nikolay Brusentsov": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Nikolay Brusentsov",
      "label": "Nikolay Brusentsov"
    },
    "Euclidean vector": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Euclidean vector",
      "label": "Euclidean vector"
    },
    "PA-RISC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/PA-RISC",
      "label": "PA-RISC"
    },
    "Internet Protocol Suite": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Internet Protocol Suite",
      "label": "Internet Protocol Suite"
    },
    "Package management system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Package management system",
      "label": "Package management system"
    },
    "Matrix (mathematics)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Matrix (mathematics)",
      "label": "Matrix (mathematics)"
    },
    "Machine learning": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Machine learning",
      "label": "Machine learning"
    },
    "Computer programming": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer programming",
      "label": "Computer programming"
    },
    "Database management system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Database management system",
      "label": "Database management system"
    },
    "CSIRAC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/CSIRAC",
      "label": "CSIRAC"
    },
    "Industrial robot": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Industrial robot",
      "label": "Industrial robot"
    },
    "Joystick": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Joystick",
      "label": "Joystick"
    },
    "Regenerative capacitor memory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Regenerative capacitor memory",
      "label": "Regenerative capacitor memory"
    },
    "CPU cache": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/CPU cache",
      "label": "CPU cache"
    },
    "Mail transfer agent": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mail transfer agent",
      "label": "Mail transfer agent"
    },
    "Museum of Science and Industry in Manchester": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Museum of Science and Industry in Manchester",
      "label": "Museum of Science and Industry in Manchester"
    },
    "Unix": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Unix",
      "label": "Unix"
    },
    "Control flow": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Control flow",
      "label": "Control flow"
    },
    "Input/output": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Input/output",
      "label": "Input/output"
    },
    "Real number": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Real number",
      "label": "Real number"
    },
    "Pascal (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Pascal (programming language)",
      "label": "Pascal (programming language)"
    },
    "Standard Template Library": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Standard Template Library",
      "label": "Standard Template Library"
    },
    "Cray": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Cray",
      "label": "Cray"
    },
    "Internet Engineering Task Force": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Internet Engineering Task Force",
      "label": "Internet Engineering Task Force"
    },
    "BASIC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/BASIC",
      "label": "BASIC"
    },
    "Photonic computing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Photonic computing",
      "label": "Photonic computing"
    },
    "DARPA": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/DARPA",
      "label": "DARPA"
    },
    "Software configuration management": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Software configuration management",
      "label": "Software configuration management"
    },
    "Microsequencer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Microsequencer",
      "label": "Microsequencer"
    },
    "Tablet computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Tablet computer",
      "label": "Tablet computer"
    },
    "Cellular automaton": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Cellular automaton",
      "label": "Cellular automaton"
    },
    "Analog computers": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Analog computers",
      "label": "Analog computers"
    },
    "Non-Uniform Memory Access": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Non-Uniform Memory Access",
      "label": "Non-Uniform Memory Access"
    },
    "File manager": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/File manager",
      "label": "File manager"
    },
    "IBM 604": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM 604",
      "label": "IBM 604"
    },
    "C++": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/C++",
      "label": "C++"
    },
    "DR-DOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/DR-DOS",
      "label": "DR-DOS"
    },
    "Computer engineering": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer engineering",
      "label": "Computer engineering"
    },
    "Netbook": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Netbook",
      "label": "Netbook"
    },
    "Mac OS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mac OS",
      "label": "Mac OS"
    },
    "Antivirus software": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Antivirus software",
      "label": "Antivirus software"
    },
    "64-bit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/64-bit",
      "label": "64-bit"
    },
    "4-bit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/4-bit",
      "label": "4-bit"
    },
    "Ballistic Research Laboratory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ballistic Research Laboratory",
      "label": "Ballistic Research Laboratory"
    },
    "Information Age": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Information Age",
      "label": "Information Age"
    },
    "List of fictional computers": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of fictional computers",
      "label": "List of fictional computers"
    },
    "Intel 8051": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 8051",
      "label": "Intel 8051"
    },
    "Tommy Flowers": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Tommy Flowers",
      "label": "Tommy Flowers"
    },
    "John von Neumann": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/John von Neumann",
      "label": "John von Neumann"
    },
    "RS-232": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/RS-232",
      "label": "RS-232"
    },
    "Optical engineering": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Optical engineering",
      "label": "Optical engineering"
    },
    "OpenGL": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/OpenGL",
      "label": "OpenGL"
    },
    "MIPS architecture": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/MIPS architecture",
      "label": "MIPS architecture"
    },
    "Lisp (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Lisp (programming language)",
      "label": "Lisp (programming language)"
    },
    "Image scanner": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Image scanner",
      "label": "Image scanner"
    },
    "CPU design": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/CPU design",
      "label": "CPU design"
    },
    "Manchester Mark 1": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Manchester Mark 1",
      "label": "Manchester Mark 1"
    },
    "Ferranti Mercury": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ferranti Mercury",
      "label": "Ferranti Mercury"
    },
    "Die (integrated circuit)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Die (integrated circuit)",
      "label": "Die (integrated circuit)"
    },
    "Time Magazine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Time Magazine",
      "label": "Time Magazine"
    },
    "Moving Picture Experts Group": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Moving Picture Experts Group",
      "label": "Moving Picture Experts Group"
    },
    "HTML": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/HTML",
      "label": "HTML"
    },
    "Handheld video game": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Handheld video game",
      "label": "Handheld video game"
    },
    "Computable function": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computable function",
      "label": "Computable function"
    },
    "Intel 80486DX2": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 80486DX2",
      "label": "Intel 80486DX2"
    },
    "Bluebottle OS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Bluebottle OS",
      "label": "Bluebottle OS"
    },
    "Interrupt": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Interrupt",
      "label": "Interrupt"
    },
    "Bit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Bit",
      "label": "Bit"
    },
    "Apache Software Foundation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Apache Software Foundation",
      "label": "Apache Software Foundation"
    },
    "Remington Rand 409": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Remington Rand 409",
      "label": "Remington Rand 409"
    },
    "Opcode": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Opcode",
      "label": "Opcode"
    },
    "Embedded system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Embedded system",
      "label": "Embedded system"
    },
    "Jacquard loom": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Jacquard loom",
      "label": "Jacquard loom"
    },
    "Soviet": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Soviet",
      "label": "Soviet"
    },
    "Charles Babbage": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Charles Babbage",
      "label": "Charles Babbage"
    },
    "Hard disk": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Hard disk",
      "label": "Hard disk"
    },
    "Computational science": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computational science",
      "label": "Computational science"
    },
    "Moors": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Moors",
      "label": "Moors"
    },
    "High-level programming language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/High-level programming language",
      "label": "High-level programming language"
    },
    "Imperative programming language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Imperative programming language",
      "label": "Imperative programming language"
    },
    "Computer network": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer network",
      "label": "Computer network"
    },
    "Maynard, Massachusetts": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Maynard, Massachusetts",
      "label": "Maynard, Massachusetts"
    },
    "Adder (electronics)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Adder (electronics)",
      "label": "Adder (electronics)"
    },
    "Science Museum (London)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Science Museum (London)",
      "label": "Science Museum (London)"
    },
    "Home computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Home computer",
      "label": "Home computer"
    },
    "Computer software": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer software",
      "label": "Computer software"
    },
    "Boolean algebra (logic)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Boolean algebra (logic)",
      "label": "Boolean algebra (logic)"
    },
    "Graphics processing unit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Graphics processing unit",
      "label": "Graphics processing unit"
    },
    "Hang (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Hang (computing)",
      "label": "Hang (computing)"
    },
    "Minicomputer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Minicomputer",
      "label": "Minicomputer"
    },
    "Control unit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Control unit",
      "label": "Control unit"
    },
    "Integrated development environment": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Integrated development environment",
      "label": "Integrated development environment"
    },
    "Photolithography": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Photolithography",
      "label": "Photolithography"
    },
    "Portable Network Graphics": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Portable Network Graphics",
      "label": "Portable Network Graphics"
    },
    "Boolean logic": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Boolean logic",
      "label": "Boolean logic"
    },
    "List of BSD operating systems": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of BSD operating systems",
      "label": "List of BSD operating systems"
    },
    "Massively multiplayer online game": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Massively multiplayer online game",
      "label": "Massively multiplayer online game"
    },
    "RAM machine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/RAM machine",
      "label": "RAM machine"
    },
    "Joseph Marie Jacquard": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Joseph Marie Jacquard",
      "label": "Joseph Marie Jacquard"
    },
    "File format": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/File format",
      "label": "File format"
    },
    "RAM": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/RAM",
      "label": "RAM"
    },
    "EDVAC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/EDVAC",
      "label": "EDVAC"
    },
    "Colossus computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Colossus computer",
      "label": "Colossus computer"
    },
    "Desktop computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Desktop computer",
      "label": "Desktop computer"
    },
    "Register machine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Register machine",
      "label": "Register machine"
    },
    "Analog signal": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Analog signal",
      "label": "Analog signal"
    },
    "International Standard Book Number": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/International Standard Book Number",
      "label": "International Standard Book Number"
    },
    "KDE": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/KDE",
      "label": "KDE"
    },
    "Object Pascal": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Object Pascal",
      "label": "Object Pascal"
    },
    "Supercomputer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Supercomputer",
      "label": "Supercomputer"
    },
    "Hard disk drive": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Hard disk drive",
      "label": "Hard disk drive"
    },
    "Aberdeen Proving Ground": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Aberdeen Proving Ground",
      "label": "Aberdeen Proving Ground"
    },
    "Shor's algorithm": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Shor's algorithm",
      "label": "Shor's algorithm"
    },
    "SCSI": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/SCSI",
      "label": "SCSI"
    },
    "Edutainment": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Edutainment",
      "label": "Edutainment"
    },
    "Stored-program computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Stored-program computer",
      "label": "Stored-program computer"
    },
    "Berkeley Software Distribution": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Berkeley Software Distribution",
      "label": "Berkeley Software Distribution"
    },
    "Interpreter (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Interpreter (computing)",
      "label": "Interpreter (computing)"
    },
    "ARM architecture": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/ARM architecture",
      "label": "ARM architecture"
    },
    "United States Army": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/United States Army",
      "label": "United States Army"
    },
    "Bus (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Bus (computing)",
      "label": "Bus (computing)"
    },
    "IBM System i": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM System i",
      "label": "IBM System i"
    },
    "SunOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/SunOS",
      "label": "SunOS"
    },
    "Roger Bacon": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Roger Bacon",
      "label": "Roger Bacon"
    },
    "QNX": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/QNX",
      "label": "QNX"
    },
    "Moscow State University": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Moscow State University",
      "label": "Moscow State University"
    },
    "Turing complete": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Turing complete",
      "label": "Turing complete"
    },
    "Java (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Java (programming language)",
      "label": "Java (programming language)"
    },
    "Python (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Python (programming language)",
      "label": "Python (programming language)"
    },
    "Battery (electricity)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Battery (electricity)",
      "label": "Battery (electricity)"
    },
    "GNU": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/GNU",
      "label": "GNU"
    },
    "Thomas Aquinas": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Thomas Aquinas",
      "label": "Thomas Aquinas"
    },
    "Puzzle video game": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Puzzle video game",
      "label": "Puzzle video game"
    },
    "Cellular architecture": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Cellular architecture",
      "label": "Cellular architecture"
    },
    "Semiconductor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Semiconductor",
      "label": "Semiconductor"
    },
    "Rendering (computer graphics)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Rendering (computer graphics)",
      "label": "Rendering (computer graphics)"
    },
    "Text editor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Text editor",
      "label": "Text editor"
    },
    "MIMD": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/MIMD",
      "label": "MIMD"
    },
    "Spintronics": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Spintronics",
      "label": "Spintronics"
    },
    "Magnetic core memory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Magnetic core memory",
      "label": "Magnetic core memory"
    },
    "Computer technology": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer technology",
      "label": "Computer technology"
    },
    "Howard Aiken": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Howard Aiken",
      "label": "Howard Aiken"
    },
    "Ada (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ada (programming language)",
      "label": "Ada (programming language)"
    },
    "Timeline of programming languages": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Timeline of programming languages",
      "label": "Timeline of programming languages"
    },
    "Alan Turing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Alan Turing",
      "label": "Alan Turing"
    },
    "Office suite": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Office suite",
      "label": "Office suite"
    },
    "Computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer",
      "label": "Computer"
    },
    "Amoeba distributed operating system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Amoeba distributed operating system",
      "label": "Amoeba distributed operating system"
    },
    "Integrated circuit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Integrated circuit",
      "label": "Integrated circuit"
    },
    "UNIVAC I": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/UNIVAC I",
      "label": "UNIVAC I"
    },
    "Operating system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Operating system",
      "label": "Operating system"
    },
    "Commodity": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Commodity",
      "label": "Commodity"
    },
    "Electromagnet": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electromagnet",
      "label": "Electromagnet"
    },
    "Exclusive or": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Exclusive or",
      "label": "Exclusive or"
    },
    "Binary numeral system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Binary numeral system",
      "label": "Binary numeral system"
    },
    "JPEG": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/JPEG",
      "label": "JPEG"
    },
    "Presentation program": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Presentation program",
      "label": "Presentation program"
    },
    "Trigonometry": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Trigonometry",
      "label": "Trigonometry"
    },
    "Mnemonic": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mnemonic",
      "label": "Mnemonic"
    },
    "Digital Equipment Corporation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Digital Equipment Corporation",
      "label": "Digital Equipment Corporation"
    },
    "Peripheral": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Peripheral",
      "label": "Peripheral"
    },
    "Institute of Electrical and Electronics Engineers": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Institute of Electrical and Electronics Engineers",
      "label": "Institute of Electrical and Electronics Engineers"
    },
    "Turing machine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Turing machine",
      "label": "Turing machine"
    },
    "Intel Core 2": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel Core 2",
      "label": "Intel Core 2"
    },
    "Programmer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Programmer",
      "label": "Programmer"
    },
    "Image processing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Image processing",
      "label": "Image processing"
    },
    "Harvard Mark I": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Harvard Mark I",
      "label": "Harvard Mark I"
    },
    "3D computer graphics software": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/3D computer graphics software",
      "label": "3D computer graphics software"
    },
    "Quantum computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Quantum computer",
      "label": "Quantum computer"
    },
    "PHP": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/PHP",
      "label": "PHP"
    },
    "Computer science": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer science",
      "label": "Computer science"
    },
    "Internet": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Internet",
      "label": "Internet"
    },
    "Icon": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Icon",
      "label": "Icon"
    },
    "Electronic Delay Storage Automatic Calculator": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electronic Delay Storage Automatic Calculator",
      "label": "Electronic Delay Storage Automatic Calculator"
    },
    "Transistors": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Transistors",
      "label": "Transistors"
    },
    "Instant messaging": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Instant messaging",
      "label": "Instant messaging"
    },
    "C Sharp (programming language)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/C Sharp (programming language)",
      "label": "C Sharp (programming language)"
    },
    "List of Linux distributions": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of Linux distributions",
      "label": "List of Linux distributions"
    },
    "Astrolabe": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Astrolabe",
      "label": "Astrolabe"
    },
    "Non-English-based programming languages": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Non-English-based programming languages",
      "label": "Non-English-based programming languages"
    },
    "IBM 7080": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM 7080",
      "label": "IBM 7080"
    },
    "Human\u2013computer interaction": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Human\u2013computer interaction",
      "label": "Human\u2013computer interaction"
    },
    "Intel 8088": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 8088",
      "label": "Intel 8088"
    },
    "PDP-11": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/PDP-11",
      "label": "PDP-11"
    },
    "Intel 8080": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel 8080",
      "label": "Intel 8080"
    },
    "Conventional PCI": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Conventional PCI",
      "label": "Conventional PCI"
    },
    "Negation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Negation",
      "label": "Negation"
    },
    "Instruction (computer science)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Instruction (computer science)",
      "label": "Instruction (computer science)"
    },
    "Graphics tablet": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Graphics tablet",
      "label": "Graphics tablet"
    },
    "Setun": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Setun",
      "label": "Setun"
    },
    "Booting": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Booting",
      "label": "Booting"
    },
    "Keyboard (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Keyboard (computing)",
      "label": "Keyboard (computing)"
    },
    "Ethernet": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ethernet",
      "label": "Ethernet"
    },
    "Byte": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Byte",
      "label": "Byte"
    },
    "Computing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computing",
      "label": "Computing"
    },
    "Pope Sylvester II": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Pope Sylvester II",
      "label": "Pope Sylvester II"
    },
    "List of programming languages by category": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of programming languages by category",
      "label": "List of programming languages by category"
    },
    "PowerPC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/PowerPC",
      "label": "PowerPC"
    },
    "Logic gate": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Logic gate",
      "label": "Logic gate"
    },
    "Superscalar": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Superscalar",
      "label": "Superscalar"
    },
    "Microcode": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Microcode",
      "label": "Microcode"
    },
    "Compiler": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Compiler",
      "label": "Compiler"
    },
    "List of computer term etymologies": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of computer term etymologies",
      "label": "List of computer term etymologies"
    },
    "Solaris (operating system)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Solaris (operating system)",
      "label": "Solaris (operating system)"
    },
    "Computer monitor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer monitor",
      "label": "Computer monitor"
    },
    "Telecommunications engineering": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Telecommunications engineering",
      "label": "Telecommunications engineering"
    },
    "Printer (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Printer (computing)",
      "label": "Printer (computing)"
    },
    "Graphical Environment Manager": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Graphical Environment Manager",
      "label": "Graphical Environment Manager"
    },
    "Flash memory": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Flash memory",
      "label": "Flash memory"
    },
    "List of programming languages": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of programming languages",
      "label": "List of programming languages"
    },
    "Artificial intelligence": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Artificial intelligence",
      "label": "Artificial intelligence"
    },
    "Common Desktop Environment": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Common Desktop Environment",
      "label": "Common Desktop Environment"
    },
    "Multi-core": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Multi-core",
      "label": "Multi-core"
    },
    "Transistor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Transistor",
      "label": "Transistor"
    },
    "Glossary of computers": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Glossary of computers",
      "label": "Glossary of computers"
    },
    "Intel Corporation": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Intel Corporation",
      "label": "Intel Corporation"
    },
    "Teleprinter": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Teleprinter",
      "label": "Teleprinter"
    },
    "Loom": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Loom",
      "label": "Loom"
    },
    "Software engineering": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Software engineering",
      "label": "Software engineering"
    },
    "University of Manchester": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/University of Manchester",
      "label": "University of Manchester"
    },
    "Open source software": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Open source software",
      "label": "Open source software"
    },
    "Personal computer hardware": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Personal computer hardware",
      "label": "Personal computer hardware"
    },
    "Flight simulator": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Flight simulator",
      "label": "Flight simulator"
    },
    "Software synthesizer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Software synthesizer",
      "label": "Software synthesizer"
    },
    "Ferranti Pegasus": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Ferranti Pegasus",
      "label": "Ferranti Pegasus"
    },
    "Software performance analysis": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Software performance analysis",
      "label": "Software performance analysis"
    },
    "Desktop publishing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Desktop publishing",
      "label": "Desktop publishing"
    },
    "Chemical computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Chemical computer",
      "label": "Chemical computer"
    },
    "OpenAL": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/OpenAL",
      "label": "OpenAL"
    },
    "Semi Automatic Ground Environment": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Semi Automatic Ground Environment",
      "label": "Semi Automatic Ground Environment"
    },
    "Execution (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Execution (computing)",
      "label": "Execution (computing)"
    },
    "Jack Dongarra": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Jack Dongarra",
      "label": "Jack Dongarra"
    },
    "First Draft of a Report on the EDVAC": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/First Draft of a Report on the EDVAC",
      "label": "First Draft of a Report on the EDVAC"
    },
    "Electromechanics": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electromechanics",
      "label": "Electromechanics"
    },
    "Audio player (software)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Audio player (software)",
      "label": "Audio player (software)"
    },
    "Analytical engine": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Analytical engine",
      "label": "Analytical engine"
    },
    "List of vacuum tube computers": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of vacuum tube computers",
      "label": "List of vacuum tube computers"
    },
    "32-bit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/32-bit",
      "label": "32-bit"
    },
    "Sergei Sobolev": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Sergei Sobolev",
      "label": "Sergei Sobolev"
    },
    "Embedded operating system": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Embedded operating system",
      "label": "Embedded operating system"
    },
    "John Atanasoff": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/John Atanasoff",
      "label": "John Atanasoff"
    },
    "Mac OS X": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mac OS X",
      "label": "Mac OS X"
    },
    "Microcontroller": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Microcontroller",
      "label": "Microcontroller"
    },
    "BIOS": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/BIOS",
      "label": "BIOS"
    },
    "International Electrotechnical Commission": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/International Electrotechnical Commission",
      "label": "International Electrotechnical Commission"
    },
    "Nanoengineering": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Nanoengineering",
      "label": "Nanoengineering"
    },
    "Integer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Integer",
      "label": "Integer"
    },
    "Grace Hopper": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Grace Hopper",
      "label": "Grace Hopper"
    },
    "Raster graphics editor": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Raster graphics editor",
      "label": "Raster graphics editor"
    },
    "Crash (computing)": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Crash (computing)",
      "label": "Crash (computing)"
    },
    "Decimal": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Decimal",
      "label": "Decimal"
    },
    "Pascal's calculator": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Pascal's calculator",
      "label": "Pascal's calculator"
    },
    "Video editing": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Video editing",
      "label": "Video editing"
    },
    "Computer architecture": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer architecture",
      "label": "Computer architecture"
    },
    "Assembly language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Assembly language",
      "label": "Assembly language"
    },
    "UNIX System V": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/UNIX System V",
      "label": "UNIX System V"
    },
    "Pentium": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Pentium",
      "label": "Pentium"
    },
    "8-bit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/8-bit",
      "label": "8-bit"
    },
    "Albertus Magnus": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Albertus Magnus",
      "label": "Albertus Magnus"
    },
    "Computer graphics": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer graphics",
      "label": "Computer graphics"
    },
    "List of operating systems": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/List of operating systems",
      "label": "List of operating systems"
    },
    "British Computer Society": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/British Computer Society",
      "label": "British Computer Society"
    },
    "History of computing hardware": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/History of computing hardware",
      "label": "History of computing hardware"
    },
    "Graphical user interface": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Graphical user interface",
      "label": "Graphical user interface"
    },
    "Electronics": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Electronics",
      "label": "Electronics"
    },
    "Programming language": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Programming language",
      "label": "Programming language"
    },
    "Fighter aircraft": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Fighter aircraft",
      "label": "Fighter aircraft"
    },
    "Central processing unit": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Central processing unit",
      "label": "Central processing unit"
    },
    "Text user interface": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Text user interface",
      "label": "Text user interface"
    },
    "Athlon 64": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Athlon 64",
      "label": "Athlon 64"
    },
    "Floppy disk": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Floppy disk",
      "label": "Floppy disk"
    },
    "File Transfer Protocol": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/File Transfer Protocol",
      "label": "File Transfer Protocol"
    },
    "IBM PC compatible": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM PC compatible",
      "label": "IBM PC compatible"
    },
    "Abacus": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Abacus",
      "label": "Abacus"
    },
    "Project Apollo": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Project Apollo",
      "label": "Project Apollo"
    },
    "IBM 7090": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM 7090",
      "label": "IBM 7090"
    },
    "American National Standards Institute": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/American National Standards Institute",
      "label": "American National Standards Institute"
    },
    "Computer speaker": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Computer speaker",
      "label": "Computer speaker"
    },
    "Cryptography": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Cryptography",
      "label": "Cryptography"
    },
    "Mechanical computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Mechanical computer",
      "label": "Mechanical computer"
    },
    "Processor register": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Processor register",
      "label": "Processor register"
    },
    "Atanasoff\u2013Berry Computer": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Atanasoff\u2013Berry Computer",
      "label": "Atanasoff\u2013Berry Computer"
    },
    "Rear Admiral": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Rear Admiral",
      "label": "Rear Admiral"
    },
    "Platform game": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Platform game",
      "label": "Platform game"
    },
    "IBM AIX": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/IBM AIX",
      "label": "IBM AIX"
    },
    "Clifford Berry": {
      "shape": "dot",
      "link": "http://en.wikipedia.org/wiki/Clifford Berry",
      "label": "Clifford Berry"
    }},

    edges:
    {
    "Computer": {
      "Optical disc": {},
      "Personal digital assistant": {},
      "Fortran": {},
      "Quantum computing": {},
      "Claude Shannon": {},
      "Turing-complete": {},
      "Analog computer": {},
      "Multiprocessing": {},
      "Institution of Engineering and Technology": {},
      "Keypunch": {},
      "Embarrassingly parallel": {},
      "DEC Alpha": {},
      "Herman Hollerith": {},
      "Text-based (computing)": {},
      "Digital audio": {},
      "GNOME": {},
      "Exploit (computer security)": {},
      "FreeDOS": {},
      "VAX": {},
      "Time 100: The Most Important People of the Century": {},
      "Electrical network": {},
      "Electrical engineering": {},
      "Conditional (programming)": {},
      "Tabulating machine": {},
      "Mozilla Foundation": {},
      "Time (magazine)": {},
      "COBOL": {},
      "MIT Press": {},
      "Museum of Science and Industry (Manchester)": {},
      "Motorola 68000": {},
      "Life magazine": {},
      "Computer-aided manufacturing": {},
      "Intel 4040": {},
      "Free software": {},
      "Spreadsheet": {},
      "Loom": {},
      "Asymmetric digital subscriber line": {},
      "Computer hardware": {},
      "Victoria University of Manchester": {},
      "Software engineering": {},
      "ARPANET": {},
      "Personal computer": {},
      "Slide rule": {},
      "3D computer graphics": {},
      "Logical disjunction": {},
      "Intel 8008": {},
      "Hard disk": {},
      "Information systems (discipline)": {},
      "Digital audio editor": {},
      "Aqua (user interface)": {},
      "1890 United States Census": {},
      "Low-level programming language": {},
      "Library (computing)": {},
      "International Federation for Information Processing": {},
      "Computer music": {},
      "Hans Meuer": {},
      "DirectX": {},
      "Java (programming language)": {},
      "Punched tape": {},
      "Hypertext Transfer Protocol": {},
      "IBM System/360": {},
      "Mobile computing": {},
      "Interactive fiction": {},
      "Motorola 6800": {},
      "Optical computing": {},
      "Real-time operating system": {},
      "Motorola 6809": {},
      "C (programming language)": {},
      "Malware scanner": {},
      "C standard library": {},
      "Microsoft Windows": {},
      "Multimedia": {},
      "Negation": {},
      "Computer multitasking": {},
      "Turing completeness": {},
      "Program counter": {},
      "DOS": {},
      "Ra\u00fal Rojas": {},
      "Arithmetic logic unit": {},
      "Memory (computers)": {},
      "Punched card": {},
      "Machine code": {},
      "Semiconductors": {},
      "Computer networking": {},
      "Moving Picture Experts Group": {},
      "Cryptanalysis": {},
      "Optical disc drive": {},
      "SPARC": {},
      "Vector processor": {},
      "Harvard architecture": {},
      "Advanced Micro Devices": {},
      "Computable function": {},
      "Logic gates": {},
      "Electronic calculator": {},
      "Digital audio player": {},
      "IBM 702": {},
      "IBM 701": {},
      "Ancient Greece": {},
      "Kermit (protocol)": {},
      "Intel 80486": {},
      "Bit": {},
      "Universal Serial Bus": {},
      "Assembler (computer programming)": {},
      "Vector graphics editor": {},
      "Dorr E. Felt": {},
      "Hero of Alexandria": {},
      "Intel 4004": {},
      "Billiard ball computer": {},
      "IBM": {},
      "JavaScript": {},
      "Digital": {},
      "Read-only memory": {},
      "FLOPS": {},
      "Smartphone": {},
      "Intel 8048": {},
      "IRIX": {},
      "Revision control": {},
      "Binary number": {},
      "Computability theory": {},
      "Non-volatile memory": {},
      "Subroutine": {},
      "Branch (computer science)": {},
      "SIMD": {},
      "TOP500": {},
      "ENIAC": {},
      "Electronic engineering": {},
      "Floating point": {},
      "Harvard Mark II": {},
      "Interpreted language": {},
      "Linux": {},
      "Educational game": {},
      "Pulse computation": {},
      "Computer Technology Limited": {},
      "Firmware": {},
      "Computer (disambiguation)": {},
      "Mainframe computer": {},
      "Two's complement": {},
      "Mobile device": {},
      "Natural language": {},
      "Scalar processor": {},
      "Logical conjunction": {},
      "Ruby (programming language)": {},
      "Oberon (operating system)": {},
      "Server (computing)": {},
      "Integer": {},
      "Execution (computing)": {},
      "Digital object identifier": {},
      "Computer-aided design": {},
      "Computer security": {},
      "Difference engine": {},
      "16-bit": {},
      "BUNCH": {},
      "Intel 80386": {},
      "Scripting language": {},
      "MS-DOS": {},
      "Plan 9 from Bell Labs": {},
      "Square root": {},
      "Norden bombsight": {},
      "Android (robot)": {},
      "Software bug": {},
      "Mouse (computing)": {},
      "Free Software Foundation": {},
      "Sabre (computer system)": {},
      "Generational list of programming languages": {},
      "Debugger": {},
      "List of computer term etymologies": {},
      "International Organization for Standardization": {},
      "Instruction set": {},
      "Antikythera mechanism": {},
      "First-person shooter": {},
      "Computer program": {},
      "Association for Computing Machinery": {},
      "Application software": {},
      "Perl": {},
      "Audio player (software)": {},
      "Truth value": {},
      "Routing": {},
      "Comment (computer programming)": {},
      "Stack machine": {},
      "Semi Automatic Ground Environment": {},
      "PDP-8": {},
      "Church\u2013Turing thesis": {},
      "Renaissance": {},
      "Computer simulation": {},
      "Portable computer": {},
      "Konrad Zuse": {},
      "Data (computing)": {},
      "Strategy game": {},
      "Random-access memory": {},
      "86-DOS": {},
      "MOS Technology 6502": {},
      "Mechanical calculator": {},
      "E-mail client": {},
      "Presentation program": {},
      "High-level programming language": {},
      "Calculator": {},
      "Association for Information Systems": {},
      "Vacuum tube": {},
      "Computation": {},
      "Pentium FDIV bug": {},
      "DNA computing": {},
      "Computer insecurity": {},
      "Microphone": {},
      "Laptop": {},
      "IBM System/36": {},
      "IBM System/32": {},
      "User interface": {},
      "Internet Society": {},
      "Microprocessor": {},
      "Ternary computer": {},
      "George Stibitz": {},
      "Serious game": {},
      "Computer data storage": {},
      "Comparison of Linux distributions": {},
      "Command-line interface": {},
      "Fiber distributed data interface": {},
      "IBM PC DOS": {},
      "Protocol (computing)": {},
      "Nikolay Brusentsov": {},
      "Euclidean vector": {},
      "PA-RISC": {},
      "Internet Protocol Suite": {},
      "Package management system": {},
      "Matrix (mathematics)": {},
      "Machine learning": {},
      "Computer programming": {},
      "Database management system": {},
      "CSIRAC": {},
      "Industrial robot": {},
      "Joystick": {},
      "Regenerative capacitor memory": {},
      "CPU cache": {},
      "Mail transfer agent": {},
      "Museum of Science and Industry in Manchester": {},
      "Unix": {},
      "Control flow": {},
      "Input/output": {},
      "Real number": {},
      "Pascal (programming language)": {},
      "Standard Template Library": {},
      "Cray": {},
      "Internet Engineering Task Force": {},
      "BASIC": {},
      "Photonic computing": {},
      "DARPA": {},
      "Software configuration management": {},
      "Microsequencer": {},
      "Tablet computer": {},
      "Cellular automaton": {},
      "Decimal": {},
      "Non-Uniform Memory Access": {},
      "File manager": {},
      "IBM 604": {},
      "C++": {},
      "DR-DOS": {},
      "Computer engineering": {},
      "Netbook": {},
      "Mac OS": {},
      "Antivirus software": {},
      "64-bit": {},
      "4-bit": {},
      "Ballistic Research Laboratory": {},
      "Information Age": {},
      "List of fictional computers": {},
      "Intel 8051": {},
      "Tommy Flowers": {},
      "John von Neumann": {},
      "RS-232": {},
      "Optical engineering": {},
      "OpenGL": {},
      "MIPS architecture": {},
      "Lisp (programming language)": {},
      "Image scanner": {},
      "Unconventional computing": {},
      "CPU design": {},
      "Manchester Mark 1": {},
      "Ferranti Mercury": {},
      "Die (integrated circuit)": {},
      "Time Magazine": {},
      "Cluster (computing)": {},
      "HTML": {},
      "Handheld video game": {},
      "Accounting software": {},
      "Intel 80486DX2": {},
      "Bluebottle OS": {},
      "Interrupt": {},
      "Byte": {},
      "Apache Software Foundation": {},
      "Remington Rand 409": {},
      "Opcode": {},
      "Embedded system": {},
      "Jacquard loom": {},
      "Soviet": {},
      "Charles Babbage": {},
      "Installation (computer programs)": {},
      "Computational science": {},
      "Moors": {},
      "Computer animation": {},
      "Imperative programming language": {},
      "Computer network": {},
      "Maynard, Massachusetts": {},
      "Adder (electronics)": {},
      "Science Museum (London)": {},
      "Home computer": {},
      "Computer software": {},
      "Boolean algebra (logic)": {},
      "Graphics processing unit": {},
      "Hang (computing)": {},
      "Minicomputer": {},
      "Control unit": {},
      "Integrated development environment": {},
      "Photolithography": {},
      "Portable Network Graphics": {},
      "Boolean logic": {},
      "List of BSD operating systems": {},
      "Massively multiplayer online game": {},
      "RAM machine": {},
      "Joseph Marie Jacquard": {},
      "File format": {},
      "RAM": {},
      "EDVAC": {},
      "Colossus computer": {},
      "Computer graphics": {},
      "Register machine": {},
      "International Standard Book Number": {},
      "KDE": {},
      "Object Pascal": {},
      "Supercomputer": {},
      "Hard disk drive": {},
      "Aberdeen Proving Ground": {},
      "Shor's algorithm": {},
      "SCSI": {},
      "Edutainment": {},
      "Stored-program computer": {},
      "Berkeley Software Distribution": {},
      "Interpreter (computing)": {},
      "ARM architecture": {},
      "United States Army": {},
      "Bus (computing)": {},
      "IBM System i": {},
      "SunOS": {},
      "Roger Bacon": {},
      "QNX": {},
      "Moscow State University": {},
      "Turing complete": {},
      "Human\u2013computer interaction": {},
      "Python (programming language)": {},
      "GNU": {},
      "Thomas Aquinas": {},
      "Puzzle video game": {},
      "Cellular architecture": {},
      "Semiconductor": {},
      "Rendering (computer graphics)": {},
      "Text editor": {},
      "MIMD": {},
      "Spintronics": {},
      "Magnetic core memory": {},
      "Computer technology": {},
      "Howard Aiken": {},
      "Ada (programming language)": {},
      "Timeline of programming languages": {},
      "Alan Turing": {},
      "Common Desktop Environment": {},
      "Office suite": {},
      "PDP-11": {},
      "Integrated circuit": {},
      "UNIVAC I": {},
      "Operating system": {},
      "Commodity": {},
      "Electromagnet": {},
      "Exclusive or": {},
      "Binary numeral system": {},
      "JPEG": {},
      "Asynchronous Transfer Mode": {},
      "Trigonometry": {},
      "Mnemonic": {},
      "Digital Equipment Corporation": {},
      "Peripheral": {},
      "Institute of Electrical and Electronics Engineers": {},
      "Turing machine": {},
      "Intel Core 2": {},
      "Programmer": {},
      "Image processing": {},
      "Harvard Mark I": {},
      "PowerPC": {},
      "Booting": {},
      "Quantum computer": {},
      "PHP": {},
      "Computer science": {},
      "Internet": {},
      "Non-English-based programming languages": {},
      "Electronic Delay Storage Automatic Calculator": {},
      "Instant messaging": {},
      "C Sharp (programming language)": {},
      "List of Linux distributions": {},
      "Astrolabe": {},
      "Analog signal": {},
      "IBM 7080": {},
      "Icon": {},
      "Intel 8088": {},
      "Amoeba distributed operating system": {},
      "Intel 8080": {},
      "Conventional PCI": {},
      "Simple Mail Transfer Protocol": {},
      "Instruction (computer science)": {},
      "Graphics tablet": {},
      "Setun": {},
      "3D computer graphics software": {},
      "Keyboard (computing)": {},
      "Ethernet": {},
      "Transistors": {},
      "Computing": {},
      "Pope Sylvester II": {},
      "Flash memory": {},
      "Logic gate": {},
      "Superscalar": {},
      "Microcode": {},
      "Compiler": {},
      "Battery (electricity)": {},
      "Solaris (operating system)": {},
      "Computer monitor": {},
      "Telecommunications engineering": {},
      "Printer (computing)": {},
      "Graphical Environment Manager": {},
      "Fighter aircraft": {},
      "List of programming languages": {},
      "Artificial intelligence": {},
      "Cryptography": {},
      "Multi-core": {},
      "Transistor": {},
      "Glossary of computers": {},
      "Intel Corporation": {},
      "Teleprinter": {},
      "HP-UX": {},
      "Algorithm": {},
      "University of Manchester": {},
      "Open source software": {},
      "Personal computer hardware": {},
      "Flight simulator": {},
      "Software synthesizer": {},
      "Ferranti Pegasus": {},
      "Software performance analysis": {},
      "Desktop publishing": {},
      "Chemical computer": {},
      "OpenAL": {},
      "Bourne shell": {},
      "IBM 650": {},
      "Jack Dongarra": {},
      "First Draft of a Report on the EDVAC": {},
      "Electromechanics": {},
      "Manchester Small-Scale Experimental Machine": {},
      "Analytical engine": {},
      "List of vacuum tube computers": {},
      "32-bit": {},
      "Sergei Sobolev": {},
      "Embedded operating system": {},
      "John Atanasoff": {},
      "Mac OS X": {},
      "Microcontroller": {},
      "BIOS": {},
      "International Electrotechnical Commission": {},
      "Nanoengineering": {},
      "List of programming languages by category": {},
      "Grace Hopper": {},
      "Raster graphics editor": {},
      "Crash (computing)": {},
      "Analog computers": {},
      "Pascal's calculator": {},
      "Video editing": {},
      "Assembly language": {},
      "UNIX System V": {},
      "Pentium": {},
      "8-bit": {},
      "Albertus Magnus": {},
      "Desktop computer": {},
      "List of operating systems": {},
      "British Computer Society": {},
      "History of computing hardware": {},
      "Graphical user interface": {},
      "Electronics": {},
      "Programming language": {},
      "Central processing unit": {},
      "Text user interface": {},
      "Athlon 64": {},
      "Floppy disk": {},
      "Atanasoff\u2013Berry Computer": {},
      "Rear Admiral": {},
      "Abacus": {},
      "Project Apollo": {},
      "IBM 7090": {},
      "American National Standards Institute": {},
      "Computer speaker": {},
      "Computer architecture": {},
      "Mechanical computer": {},
      "Processor register": {},
      "File Transfer Protocol": {},
      "IBM PC compatible": {},
      "Platform game": {},
      "IBM AIX": {},
      "Clifford Berry": {}}
    }
	};*/

  sys.graft(data);


    
  })

})(this.jQuery)