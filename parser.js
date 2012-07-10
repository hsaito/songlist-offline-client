var targetURI = "http://songlist.hclippr.com/api.php?callback=JSON_CALLBACK";
var targetFormat = "JSONP";
var songlistdb = null;
var songData = [];

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
					   startDatabaseReader(function(sdata)
							       {
								   $scope.songData = songData;
								   document.getElementById('content').innerHTML = "<em>Ready</em>";
							       }
							      );
				       }
				      ).
			       error(function(data, status) {
					 document.getElementById('content').innerHTML = "<em>Error reading data</em>";
					 console.log(data);
				     }); 
		       }
		     );	
    };   
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


	songlistdb.transaction(function (tx)
			       {
				   songData = [];
				   console.log("Creating table");
				   tx.executeSql('SELECT * FROM List',[], function(tx, rs){
						     for(var i = 0; i< rs.rows.length; i++) {
							 console.log("Getting "+i);
							 var row = rs.rows.item(i);
							 songData[i] = [];
							 songData[i].songId = row['songId'];
							 songData[i].songTitle = row['songTitle'];
							 songData[i].songArtist = row['songArtist'];
							 songData[i].songReference = row['songReference'];
							 songData[i].joysound = row['joysound'];
						     }
						 });   
			       });				 
	callback(songData); 	

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