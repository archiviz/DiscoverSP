using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data.SqlClient;
using System.Security.Cryptography;
using System.Web.Services;
using System.Text;
using Newtonsoft.Json.Linq;
using System.Globalization;
using Microsoft.SharePoint.Client;
using Microsoft.SharePoint;
using Microsoft.IdentityModel.S2S.Tokens;
using System.Net;
using System.IO;
using System.Xml;
using System.Net.Mail;
using System.Configuration;

namespace DiscoverSharepointWeb.Pages
{
    
    public partial class Default : System.Web.UI.Page
    {
 

        SharePointContextToken contextToken;
        Uri sharepointUrl;
        string siteName;
       // string currentUser;
        static string TenantId;
        static string UserToken;
        static string currentUser;
        static bool isAdmin;
        List<string> listOfUsersREST = new List<string>();
        List<string> listOfListsREST = new List<string>();

        protected void Page_Load(object sender, EventArgs e)
        {
            TokenHelper.TrustAllCertificates();
            string contextTokenString = TokenHelper.GetContextTokenFromRequest(Request);

            if (contextTokenString != null)
            {
                contextToken = TokenHelper.ReadAndValidateContextToken(contextTokenString, Request.Url.Authority);
               var hostWeb = Request.QueryString["SPHostUrl"];

               //for admin security--
               //obtain sharepoint url from referrer instead of the Querystring (insures that the app was launched from sharepoint)
               Uri referrer = new Uri(Request.UrlReferrer.ToString());

               //split the referrer host and use only the hostname to get the root tenant id--
               string tenanthost = referrer.Host;
               //get base tenant id by splittin the hosturl 
               string[] pieces = tenanthost.Split('.');
               string tenantid = pieces[0];
               //remove any known collection identifiers 
               if (tenantid.EndsWith("-my", StringComparison.CurrentCultureIgnoreCase))
               {
                   TenantId = tenantid.Replace("-my", "");
               }
               else if (tenantid.EndsWith("-public", StringComparison.CurrentCultureIgnoreCase))
               {
                   TenantId = tenantid.Replace("-public", "");
               }

                //get user uri from Querystring
               sharepointUrl = new Uri(Request.QueryString["SPHostUrl"]);
               string rooturl = sharepointUrl.GetLeftPart(UriPartial.Authority).Replace("-my.sharepoint", ".sharepoint");

               //get rooturi from base tenantid
               Uri rooturi = new Uri(rooturl);

                //build accessToken for user info
                string accessToken = TokenHelper.GetAccessToken(contextToken, sharepointUrl.Authority).AccessToken;

                //build apponly access toen for admin info
                string appOnlyAccessToken = TokenHelper.GetAppOnlyAccessToken(contextToken.TargetPrincipalName, rooturi.Authority, contextToken.Realm).AccessToken;


                //Get site Client context for Current User
                ClientContext clientContext = TokenHelper.GetClientContextWithAccessToken(sharepointUrl.ToString(), accessToken);
                //Get appOnly client context for root calls
                ClientContext clientContextapp = TokenHelper.GetClientContextWithAccessToken(rooturl, appOnlyAccessToken);
                
                //load current web
                Web web = clientContext.Web;
                clientContext.Load(web);
                clientContext.ExecuteQuery();

               //get logged in user's info
               clientContext.Load(web.CurrentUser);
               clientContext.ExecuteQuery();

               //save loginname
               currentUser = clientContext.Web.CurrentUser.LoginName;
               int userId = clientContext.Web.CurrentUser.Id;
               string userName = clientContext.Web.CurrentUser.Title;

               GroupCollection siteGroups = clientContextapp.Site.RootWeb.SiteGroups;
               clientContextapp.Load(siteGroups);
               clientContextapp.ExecuteQuery();

               UserCollection admins = siteGroups.GetByName("Owners").Users;
               clientContextapp.Load(admins);
               clientContextapp.ExecuteQuery();

               isAdmin = false;
               //var res = "";
               foreach (User user in admins)
                {
                    if (user.LoginName == currentUser)
                    {
                       isAdmin = true;
                    }
                }
            //res += isAdmin;

            //res += siteName;
           // res += currentUser;
            //res += mainurl;
            //res += rooturl;
            //res += referrer;
            //res += isAdmin;
            //res += tenantid;

            //ltlTest.Text = res;
            var vals = checkTenant(TenantId);
            int c = vals.Count;
            if (c > 0)
            {
                hidden.Text = vals[0];
                recommended.Text = vals[1];
                approved.Text = vals[2];
            }
            else
            {
                hidden.Text = "";
                recommended.Text = "7,13,17,9,5,11";
                approved.Text = "0";
                
            }

            favorites.Text = checkUser(currentUser, TenantId);
             
            //var initarray = checkTenant(string tenantg);
            //if user has full control of root site, load admin scripts and button
             if (isAdmin)
             {
                 adminscripts.Text = loadAdminScripts();
                 adminbutton.Text = loadAdminButton();
                 adminname.Text = userName;
                 addhiddenfunc.Text = "parse(hidden);addHidden();";
             }
             else
             {
                 adminscripts.Text = "";
                 adminbutton.Text = "";
                 adminname.Text = "";
                 addhiddenfunc.Text = "";
             }

                //

             UserToken = getUserToken(userId);
             usertoken.Text = UserToken;
             insharepoint.Text = "true";
             hostweb.Text = hostWeb;
             
            }
            else if (!IsPostBack)
            {
                hidden.Text = "";
                recommended.Text = "7,13,17,9,5,11";
                favorites.Text = "";
                approved.Text = "0";
                adminname.Text = "";
                adminbutton.Text = "";
                adminscripts.Text = "";
                insharepoint.Text = "false";
                hostweb.Text = "";
                return;
            }
        }

      void Page_Init (object sender, EventArgs e) {
   ViewStateUserKey = Session.SessionID;
}


        //check tenant in db and get recommended use cases, add if not present
        public static List<string> checkTenant(string tenantg)
        {

            //retrieve db connection string
            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();
                //hardcoded recommended defaults (recommended values are stored in the tenant table because they are global for each tenant);
                //hash tenantid
                string tenanthash = getHashSha256(tenantg);
                //create query
                string s = "SELECT * FROM tenant " +
                          "WHERE tenant_id = @tenanthash";
                SqlCommand cmds = new SqlCommand(s, connection);
                cmds.Parameters.Add(new SqlParameter("tenanthash", tenanthash));

                //SqlCommand myCommand = new SqlCommand("SELECT recommended FROM tenant WHERE tenant_id = '" + tenanthash + "'", connection);
                var values = new List<string>();
                object result = cmds.ExecuteScalar();
                //if the tenant has not been stored, add it
                    if ((result == null) || (result == DBNull.Value))
                    {

                  string sc = "INSERT INTO tenant (tenant_id, recommended, hidden) " +
                          "Values (@tenanthash, '7,13,17,9,5,11', 'nan')";
                        SqlCommand cmdsu = new SqlCommand(sc, connection);
                        cmdsu.Parameters.Add(new SqlParameter("tenanthash", tenanthash));

                       // SqlCommand myCommandins = new SqlCommand("INSERT INTO tenant (tenant_id, recommended, hidden) Values ('" + tenanthash + "', '7,13,17,9,5,11', 'nan')", connection);
                        cmdsu.ExecuteNonQuery();
                        connection.Close();

                    }
                    else
                    {
                        string sc = "SELECT * FROM tenant " +
                          "WHERE tenant_id = @tenanthash";
                        SqlCommand cmdsu = new SqlCommand(sc, connection);
                        cmdsu.Parameters.Add(new SqlParameter("tenanthash", tenanthash));

                        //SqlCommand myCommand2 = new SqlCommand("SELECT * FROM tenant WHERE tenant_id = '" + tenanthash + "'", connection);
                  

                        SqlDataReader reader = cmds.ExecuteReader();
                            while (reader.Read())
                            {
                                values.Add(Convert.ToString(reader["hidden"], CultureInfo.InvariantCulture));
                                values.Add(Convert.ToString(reader["recommended"], CultureInfo.InvariantCulture));
                                values.Add(Convert.ToString(reader["approved"], CultureInfo.InvariantCulture));
                            }
                        }



                        //close the db connection
                        connection.Close();

                        return values;
            }
        }
         //check the user in the db and get favorites, add if not present

      

         public static string checkUser(string user, string tenant)
        {
            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string favorites = "nan";
                //hash userid
                string userhash = getHashSha256(user);
                //hash tenantid
                string tenanthash = getHashSha256(tenant);

                //check user db
                string ss = "SELECT favorites " +
                          "FROM users WHERE sp_id = @userhash";
                SqlCommand cmds = new SqlCommand(ss, connection);
                cmds.Parameters.Add(new SqlParameter("userhash", userhash));

               //SqlCommand myCommand = new SqlCommand("SELECT favorites FROM users WHERE sp_id = '" + userhash + "'", connection);
                object result = cmds.ExecuteScalar();

                //if user doesn't exist add to db
                if ((result == null) || (result == DBNull.Value))
                {
                    string s = "INSERT INTO users " +
                          "(tenant_id, sp_id, favorites) " +
                          "SELECT tenant.ID,@userhash,@favorites FROM tenant WHERE tenant.tenant_id = @tenanthash";
                    SqlCommand cmd = new SqlCommand(s, connection);
                    cmd.Parameters.Add(new SqlParameter("userhash", userhash));
                    cmd.Parameters.Add(new SqlParameter("favorites", favorites));
                    cmd.Parameters.Add(new SqlParameter("tenanthash", tenanthash));

                   // SqlCommand myCommandins = new SqlCommand("INSERT INTO users (tenant_id, sp_id, favorites) SELECT tenant.ID,'" + userhash + "','" + favorites + "' FROM tenant WHERE tenant.tenant_id = '" + tenanthash + "'", connection);
                    cmd.ExecuteNonQuery();
                    
                    //close conneection
                    connection.Close();
                    //return empty favorites for responsee
                    return "";

                }
                else
                {
                    //close conneection
                    connection.Close();
                    //return saved favorites
                    if ((string)result == "nan")
                    {
                        return "";
                    }
                    else
                    {
                        return (string)result;
                    }
                }

            }
        }

        //add favorite for user
        [WebMethod]
        public static string addFavorite(string usertoken, string favs)
        {
            if (usertoken == UserToken)
            {
            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                //hash the user id
                string userhash = getHashSha256(currentUser);
                string s = "UPDATE users " +
                           "SET favorites = @favs WHERE sp_id = @userhash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("favs", favs));
                cmd.Parameters.Add(new SqlParameter("userhash", userhash));
                //update the favorite use cases
                //SqlCommand myCommandins = new SqlCommand("UPDATE users SET favorites = '" + favs + "' WHERE sp_id = '" + userhash + "'", connection);
                cmd.ExecuteNonQuery();
                connection.Close();
                //send response
                return "ok";
            }
             }
            else
            {
                return "Invalid User Token";
            }
        }

        //add recommended for admin
        [WebMethod]
        public static string addRec(string usertoken, string rec)
        {
            if (usertoken == UserToken && isAdmin)
            {
            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();
                //hash the tenant id
                string tenanthash = getHashSha256(TenantId);
                string s = "UPDATE tenant " +
                           "SET recommended = @rec WHERE tenant_id = @tenanthash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("rec", rec));
                cmd.Parameters.Add(new SqlParameter("tenanthash", tenanthash));
                //update the recommended use cases
                //SqlCommand myCommandins = new SqlCommand("UPDATE tenant SET recommended = '" + rec + "' WHERE tenant_id = '" + tenanthash + "'", connection);
                cmd.ExecuteNonQuery();
                connection.Close();
                //send response
                return "ok";
            }
             }
            else
            {
                return "Invalid User Token";
            }
        }

        //add recommended for admin
        [WebMethod]
        public static string approve(string usertoken)
        {
            if (usertoken == UserToken && isAdmin)
            {
            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();
                //hash the tenant id
                

                string tenanthash = getHashSha256(TenantId);

                string s = "UPDATE tenant " +
                           "SET approved = 1 WHERE tenant_id = @tenanthash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("tenanthash", tenanthash));
                //update the recommended use cases
                //SqlCommand myCommandins = new SqlCommand("UPDATE tenant SET approved = 1 WHERE tenant_id = '" + tenanthash + "'", connection);
                cmd.ExecuteNonQuery();
                connection.Close();
                //send response
                return "ok";
            }
             }
            else
            {
                return "Invalid User Token";
            }
        }

        //add hidden item for admin
        [WebMethod]
        public static string addHidden(string usertoken, string hidden)
        {
            if (usertoken == UserToken && isAdmin)
            {

            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();
                //hash the tenant id
                string tenanthash = getHashSha256(TenantId);
                string s = "UPDATE tenant " +
                           "SET hidden = @hidden WHERE tenant_id = @tenanthash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("hidden", hidden));
                cmd.Parameters.Add(new SqlParameter("tenanthash", tenanthash));
                //update the recommended use cases
                //SqlCommand myCommandins = new SqlCommand("UPDATE tenant SET hidden = '" + hidden + "' WHERE tenant_id = '" + tenanthash + "'", connection);
                cmd.ExecuteNonQuery();
                connection.Close();
                //send response
                return "ok";
            }
            }
            else
            {
                return "Invalid User Token";
            }
        }

        [WebMethod]
        public static string addPageview(string usertoken, string pageid)
        {
            if (usertoken == UserToken)
            {
            int tenant_id = getTenantFromUser(currentUser);
            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();

                string userhash = getHashSha256(currentUser);
                string s = "INSERT INTO page_views (user_id, page_id, tenant_id) " +
                           "SELECT users.ID,@pageid,@tenant_id FROM users WHERE users.sp_id = @userhash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("pageid", pageid));
                cmd.Parameters.Add(new SqlParameter("tenant_id", tenant_id.ToString(CultureInfo.InvariantCulture)));
                cmd.Parameters.Add(new SqlParameter("userhash", userhash));
                //SqlCommand myCommandins = new SqlCommand("INSERT INTO page_views (user_id, page_id, tenant_id) SELECT users.ID,'" + pageid + "'," + tenant_id.ToString() + " FROM users WHERE users.sp_id = '" + userhash + "'", connection);
                cmd.ExecuteNonQuery();
                //close connection
                connection.Close();
                return "ok";
            }
            }
            else
            {
                return "Invalid User Token";
            }
        }

        [WebMethod]
        public static string addVideoView(string usertoken, string vidid)
        {
            if (usertoken == UserToken)
            {
            int tenant_id = getTenantFromUser(currentUser);
            string connectionString = GetConnectionString();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();

                string userhash = getHashSha256(currentUser);
                string s = "INSERT INTO video_views (user_id, video_id, tenant_id) " +
                           "SELECT users.ID,@vidid,@tenant_id FROM users WHERE users.sp_id = @userhash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("vidid", vidid));
                cmd.Parameters.Add(new SqlParameter("tenant_id", tenant_id.ToString(CultureInfo.InvariantCulture)));
                cmd.Parameters.Add(new SqlParameter("userhash", userhash));
                //SqlCommand myCommandins = new SqlCommand("INSERT INTO video_views (user_id, video_id, tenant_id) SELECT users.ID,'" + vidid + "'," + tenant_id.ToString() + " FROM users WHERE users.sp_id = '" + userhash + "'", connection);
                cmd.ExecuteNonQuery();
                //close connection
                connection.Close();
                return "ok";
            }
             }
            else
            {
                return "Invalid User Token";
            }
        }

       [WebMethod]
        public static string addVideoDL(string usertoken, string vidid)
        {
            if (usertoken == UserToken)
            {
                int tenant_id = getTenantFromUser(currentUser);

                string connectionString = GetConnectionString();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    //open the connection
                    connection.Open();

                    string userhash = getHashSha256(currentUser);
                    string s = "INSERT INTO video_downloads (user_id, video_id, tenant_id) " +
                               "SELECT users.ID,@vidid,@tenant_id FROM users WHERE users.sp_id = @userhash";
                    SqlCommand cmd = new SqlCommand(s, connection);
                    cmd.Parameters.Add(new SqlParameter("vidid", vidid));
                    cmd.Parameters.Add(new SqlParameter("tenant_id", tenant_id.ToString(CultureInfo.InvariantCulture)));
                    cmd.Parameters.Add(new SqlParameter("userhash", userhash));
                    //SqlCommand myCommandins = new SqlCommand("INSERT INTO video_downloads (user_id, video_id, tenant_id) SELECT users.ID,'" + vidid + "'," + tenant_id.ToString() + "  FROM users WHERE users.sp_id = '" + userhash + "'", connection);
                    cmd.ExecuteNonQuery();
                    //close connection
                    connection.Close();
                    return "ok";
                }
            }
            else
            {
                return "Invalid User Token";
            }
        }

        [WebMethod]
       public static string addGuideDL(string usertoken, string guideid)
        {
            if (usertoken == UserToken)
            {
                int tenant_id = getTenantFromUser(currentUser);

                string connectionString = GetConnectionString();
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    //open the connection
                    connection.Open();

                    string userhash = getHashSha256(currentUser);
                    string s = "INSERT INTO guide_downloads (user_id, guide_id, tenant_id) " +
                               "SELECT users.ID,@guideid,@tenant_id FROM users WHERE users.sp_id = @userhash";
                    SqlCommand cmd = new SqlCommand(s, connection);
                    cmd.Parameters.Add(new SqlParameter("guideid", guideid));
                    cmd.Parameters.Add(new SqlParameter("tenant_id", tenant_id.ToString(CultureInfo.InvariantCulture)));
                    cmd.Parameters.Add(new SqlParameter("userhash", userhash));
                    //SqlCommand myCommandins = new SqlCommand("INSERT INTO guide_downloads (user_id, guide_id, tenant_id) SELECT users.ID,'" + guideid + "'," + tenant_id.ToString() + " FROM users WHERE users.sp_id = '" + userhash + "'", connection);
                    cmd.ExecuteNonQuery();
                    //close connection
                    connection.Close();
                    return "ok";
                }
            }
            else
            {
                return "Invalid User Token";
            }
        }

        //function getAnalytics
        //process: recieves data from analytics dropdown actions and retrieves counts from SQL based on time ranges
        [WebMethod]
        public static string getAnalytics(string usertoken, string type, string objid, string sort)
        {
            if (usertoken == UserToken&&isAdmin)
            {
                int tenant_id = getTenantid(TenantId);

                string connectionString = GetConnectionString();
                string[] keybase = type.Split('_');
                string keystring = keybase[0] + "_id";

   
                //Dictionary<string, string> dictionary = new Dictionary<string, string>();


                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    //open the connection
                    connection.Open();

                    string s = "SELECT COUNT(*) AS [Count] FROM " +
                               "@type WHERE tenant_id = @tenant_id ";

                    if (objid != "all")
                    {
                        s += "AND @keystring = @objid";
                    }

                    if (sort == "year")
                    {
                        s += "AND YEAR(date) = '2013' GROUP BY MONTH(date) ORDER BY MONTH DESC"; 
                    }
                    else
                    {
                        s += "AND MONTH(date) = @sort GROUP BY DAY(date) ORDER BY DAY DESC"; 
                    }


                    SqlCommand cmd = new SqlCommand(s, connection);

                    cmd.Parameters.Add(new SqlParameter("type", type));
                    cmd.Parameters.Add(new SqlParameter("tenant_id", tenant_id.ToString(CultureInfo.InvariantCulture)));

                    if (objid != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("keystring", keystring));
                        cmd.Parameters.Add(new SqlParameter("objid", objid));
                    }

                    if (sort != "year")
                    {
                        cmd.Parameters.Add(new SqlParameter("sort", sort));
                    }
                    
                    SqlDataReader myReader = null;
                    //SqlCommand myCommandck = new SqlCommand("SELECT COUNT(*) AS [Count] FROM " + type + " WHERE tenant_id = " + tenant_id.ToString() + " " + qadd + sorttype, connection);
                    myReader = cmd.ExecuteReader();
                    // Boolean found = false;
                    string output = "{";
                    int count = 0;
                    while (myReader.Read())
                    {
                        output += "'" + count.ToString(CultureInfo.InvariantCulture) + "':'" + Convert.ToString(myReader["Count"], CultureInfo.InvariantCulture) + "',";
                        count++;
                    }
                    output += "}";
                    //close connection
                    connection.Close();
                    return output;
                }
            }
            else
            {
                return "{'error':'Invalid User Token'}";
            }
        }

        [WebMethod]
        public static string sendFeedback(string message)
        {
            
                SmtpClient SmtpServer = new SmtpClient("outlook.office365.com");

                MailMessage Message = new MailMessage();


                Message.From = new MailAddress("admin@spusecase.onmicrosoft.com");
                Message.To.Add("iusesharepoint@microsoft.com");
                Message.Subject = "Discover Sharepoint App Feedback";
                Message.Body = message;

                try
                {
                    SmtpServer.Port = 587;
                    SmtpServer.Credentials = new System.Net.NetworkCredential("admin@spusecase.onmicrosoft.com", "pass@word2");
                    SmtpServer.EnableSsl = true;
                    SmtpServer.Send(Message);
                    return "Feedback Sent";
                }
                catch (Exception ex)
                {
                    return ex.ToString();
                }
            
            
            }
    


        public static int getTenantid(string tenantstring)
        {
            string tenanthash = getHashSha256(tenantstring);
            string connectionString = GetConnectionString();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();

                string s = "SELECT ID FROM tenant " +
                          "WHERE tenant_id = @tenanthash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("tenanthash", tenanthash));

                //SqlCommand myCommand = new SqlCommand("SELECT ID FROM tenant WHERE tenant_id = '" + tenanthash + "'", connection);

                object result = cmd.ExecuteScalar();

                if ((result == null) || (result == DBNull.Value))
                {
                    //close connection
                    connection.Close();
                    return -1;
                }
                else
                {
                    //close connection
                    connection.Close();
                    return (int)result;
                }
            }
        }

        public static int getUserid(string userstring)
        {
            string userhash = getHashSha256(userstring);
            string connectionString = GetConnectionString();



            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();

                string s = "SELECT ID FROM users " +
                          "WHERE user_id = @userhash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("userhash", userhash));

               // SqlCommand myCommand = new SqlCommand("SELECT ID FROM users WHERE user_id = '" + userhash + "'", connection);

                object result = cmd.ExecuteScalar();

                if ((result == null) || (result == DBNull.Value))
                {
                    //close connection
                    connection.Close();
                    return -1;
                }
                else
                {
                    //close connection
                    connection.Close();
                    return (int)result;
                }
            }
        }

        public static int getTenantFromUser(string userstring)
        {
            string userhash = getHashSha256(userstring);
            string connectionString = GetConnectionString();



            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                //open the connection
                connection.Open();

                string s = "SELECT tenant_id FROM users " +
                          "WHERE sp_id = @userhash";
                SqlCommand cmd = new SqlCommand(s, connection);
                cmd.Parameters.Add(new SqlParameter("userhash", userhash));

               // SqlCommand myCommand = new SqlCommand("SELECT tenant_id FROM users WHERE sp_id = '" + userhash + "'", connection);

                object result = cmd.ExecuteScalar();

                if ((result == null) || (result == DBNull.Value))
                {
                    //close connection
                    connection.Close();
                    return -1;
                }
                else
                {
                    //close connection
                    connection.Close();
                    return (int)result;
                }
            }
        }


        public static string getHashSha256(string text)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(text);
            SHA256Managed hashstring = new SHA256Managed();
            byte[] hash = hashstring.ComputeHash(bytes);
            string hashString = string.Empty;
            foreach (byte x in hash)
            {
                hashString += String.Format(CultureInfo.InvariantCulture, "{0:x2}", x);
            }
            return hashString;
        }

        public static string GetConnectionString()
        {
            return ConfigurationManager.ConnectionStrings["myConnectionString"].ConnectionString;
            //return "Server=tcp:fizh8y60zs.database.windows.net,1433;Database=Sharepoint101;User ID=adopt-sharepoint@fizh8y60zs;Password=SPusecase38655;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;";
        }

        private string SafeSqlLiteral(string inputSQL)
        {
            return inputSQL.Replace("'", "''");
        }

        private string loadAdminScripts()
        {
            return "function addHidden() {" +
            "var hide;if (hidden === ''||hidden === null||typeof hidden === 'undefined') {" +
                   " hide = 'nan';" +
                "} else {" +
                    "hide = hidden;" +
                "}" +
                "var hidinfo = { 'usertoken': userToken, 'hidden': hide };" +
                "$.ajax({" +
                    "type: 'POST'," +
                    "url: 'Default.aspx/addHidden'," +
                    "data: JSON.stringify(hidinfo)," +
                    "contentType: 'application/json; charset=utf-8'," +
                    "dataType: 'json'," +
                    "success: function (d) {" +
                        "if (d.d != 'ok') {" +
                            "console.log('error in addhidden() ' + d.d);" +
                        "}" +
                   " }," +
                   " error: function (xhr, err) { console.log('readyState: ' + xhr.readyState + 'status: ' + xhr.status + 'responseText: ' + xhr.responseText); }" +
                "});" +
           " }" +

           " function approve() {" +

               " var appinfo = { 'usertoken': userToken};" +
                "$.ajax({" +
                    "type: 'POST'," +
                    "url: 'Default.aspx/approve'," +
                    "data: JSON.stringify(appinfo)," +
                    "contentType: 'application/json; charset=utf-8'," +
                    "dataType: 'json'," +
                    "success: function (d) {" +
                        "if (d.d != 'ok') {" +

                            "console.log('error in approve() ' + d.d);" +
                       " } else {" +
                           " approved = 1;" +
                        "}" +
                    "}," +
                    "error: function (xhr, err) { console.log('readyState: ' + xhr.readyState + 'status: ' + xhr.status + 'responseText: ' + xhr.responseText); }" +
                "});" +
            "}" +

           " //get analytics data from db as JSON array" +
           " //@params:" +
           " //type = database table name ie. video_views" +
            "//object = specific usecase/video/guide id or 'all' for all items" +
            "//sort = get specific month by id or full year with 'year'" +
           " function getAnalytics(type, object, sorttype) {" +
               " var guideinfo = { 'usertoken': userToken, 'type': type, 'objid': object, 'sort': sorttype };" +
                "$.ajax({" +
                    "type: 'POST'," +
                    "url: 'Default.aspx/addGuideDL'," +
                    "data: JSON.stringify(guideinfo)," +
                    "contentType: 'application/json; charset=utf-8'," +
                    "dataType: 'json'," +
                    "success: function (d) {" +
                        "//return json for analytics display" +
                        "return d.d;" +
                    "}," +
                    "error: function (xhr, err) { console.log('readyState: ' + xhr.readyState + 'status: ' + xhr.status + 'responseText: ' + xhr.responseText); }" +
                "});" +
            "};";
       }

        private string loadAdminButton()
        {
            return "<a id=\"admin\" style=\"font-size: 13px;color:#666;\" href=\"#admin\">Admin Login</a>&nbsp;&nbsp;|&nbsp;&nbsp;";
        }

        private string getUserToken(int userID)
        {
            var dt = DateTime.Now;
            var ticks = dt.Ticks;
            var seconds = ticks / TimeSpan.TicksPerSecond;
            return getHashSha256(userID.ToString(CultureInfo.InvariantCulture) + seconds.ToString(CultureInfo.InvariantCulture) + userID.ToString(CultureInfo.InvariantCulture));
        }

        private string loadUser()
        {
            return currentUser;
        }
      
    }

         
    }
  