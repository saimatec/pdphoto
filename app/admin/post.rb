ActiveAdmin.register Post do

form do |f|
   f.inputs "post" do
f.input :title, :required => false
f.input :content, :required => false
    f.input :photo, :required => false


   end
   f.buttons
 end

end
