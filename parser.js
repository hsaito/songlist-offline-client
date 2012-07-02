var targetURI = "http://songlist.hclippr.com/api.php?callback=JSON_CALLBACK";
var targetFormat = "JSONP";
var songlistdb = null;

function readController($scope, $http)
{
    $scope.update = function() {
	$scope.method = targetFormat;
	$scope.url = targetURI;
	startDatabase(function()
		       {
			   document.getElementById('content').innerHTML = "<em>Loading...</em>";
			   $http({method: $scope.method, url: $scope.url}).
			       success(function(data, status) {
					   songlistdb.transaction(function (tx)
								  {
								      for(var i = 0; i < data.item.length; i++)
								      {
									  var sl = data.item[i];
									  
									  console.log("Adding item "+ sl.songId+" at "+i);
									  tx.executeSql("INSERT INTO list (localId, songId, songTitle, songArtist, songReference, joysound) VALUES (NULL, ?, ?, ?, ?, ?)", [sl.songId, sl.songTitle, sl.songArtist, sl.songReference, sl.karaoke.vnd_com_joysound_wii]);
								      }
								  }
								  
								 );
					   startDatabaseReader(dumpToPage);
				       }
				      ).
			       error(function(data, status) {
					 document.getElementById('content').innerHTML = "Error reading data";
					 console.log(data);
				     }); 
		       }
		     );	
    };   
}  

function dumpToPage(result)
{
    console.log("Rendering result");
    document.getElementById('content').innerHTML = result;
}

function startDatabaseReader(callback)
{
    try {
	if(window.openDatabase)
	{
	    songlistdb = openDatabase("Songlist", "1.0", "Songlist Local Database", 200000);
	    if(!songlistdb)
		alert("Failed to open the database on disk. This may be because the author screwed up, but it could be mean that you don't have enough disk space.");
	}
	else
	    alert("Couldn't open the database.");
    } catch (x) {
	songlistdb = null; // Just to not reference bad DB.
	alert("Couldn't open the database. Caught Exception\n"+x);
    }    
    if(songlistdb != null)
    {
	// Authors the list
	var result = "<table><table border=\"\"1\"><tr><th>Song ID</th><th>Title</th><th>Artist</th><th>Origin</th><th>JoySound Wii</th></tr>";
	songlistdb.transaction(function (tx)
			       {
				   console.log("Creating table");
				   tx.executeSql('SELECT * FROM List',[], function(tx, rs){
						     for(var i = 0; i< rs.rows.length; i++) {
							 console.log("Getting "+i);
							 var row = rs.rows.item(i);
							 result = result + "<tr><td>"+row['songId']+
							     "</td><td>"+row['songTitle']+
							     "</td><td>"+row['songArtist']+
							     "</td><td>"+row['songReference']+
							     "</td><td>"+row['joysound']+"</td></tr>";
			  }
						     result = result + "</table>";
						     callback(result);
						 });   
			       }
			      );
    }
}



// Open (or create) database
function startDatabase(callback)
{
    try {
	if(window.openDatabase)
	{
	    songlistdb = openDatabase("Songlist", "1.0", "Songlist Local Database", 200000);
	    if(!songlistdb)
		alert("Failed to open the database on disk. This may be because the author screwed up, but it could be mean that you don't have enough disk space.");
	}
	else
	    alert("Couldn't open the database.");
    } catch (x) {
	songlistdb = null; // Just to not reference bad DB.
	alert("Couldn't open the database. Caught Exception\n"+x);
    }
    if(songlistdb != null)
    {
	// Honestly, I'm not very happy with the following.
	// I don't want drop the db everytime!
	songlistdb.transaction(function (tx)
			       {
				   console.log("Dropping database");
				   tx.executeSql("DROP TABLE List");
			       }
			      );
	songlistdb.transaction(function (tx)
			       {
				   console.log("Creating database");
				   tx.executeSql('CREATE TABLE List (localId INTEGER PRIMARY KEY AUTOINCREMENT, songId INTEGER, songTitle TEXT, songArtist TEXT, songReference TEXT, joysound TEXT)');
			       }
			      );
	callback();
    }
}