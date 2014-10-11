class UserMailer < ActionMailer::Base
  default from: "from@example.com"

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.user_mailer.ab.subject
  #
  def ab e,s,m
    @e  = e
    @s = s
    @m = m 
    @greeting = "Hi"
     mail to: "kunalwaghray52@gmail.com"
  end
end
